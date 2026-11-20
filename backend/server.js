const express = require('express');
const os = require('os');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_NAME = process.env.INSTANCE_NAME || 'backend-desconocido';
const INSTANCE_COLOR = process.env.INSTANCE_COLOR || '#2563eb';

const register = new client.Registry();
client.collectDefaultMetrics({ register, labels: { backend_instance: INSTANCE_NAME } });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP recibidas por instancia',
  labelNames: ['method', 'route', 'status_code', 'backend_instance'],
  registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracion de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status_code', 'backend_instance'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  registers: [register]
});

let requestCounter = 0;

app.use((req, res, next) => {
  if (req.path === '/metrics') return next();
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const labels = { method: req.method, route: req.path, status_code: res.statusCode, backend_instance: INSTANCE_NAME };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

app.get('/', (req, res) => {
  requestCounter++;
  const hostname = os.hostname();
  const timestamp = new Date().toISOString();
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ instancia: INSTANCE_NAME, contenedor_id: hostname, peticiones_atendidas: requestCounter, timestamp });
  }
  res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${INSTANCE_NAME}</title></head>
<body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
<div style="background:#1e293b;border-top:8px solid ${INSTANCE_COLOR};border-radius:12px;padding:2rem;text-align:center;max-width:460px">
<p style="color:#94a3b8">UAO - Sistemas Operativos</p>
<h1 style="background:${INSTANCE_COLOR};padding:.4rem 1rem;border-radius:99px;display:inline-block">${INSTANCE_NAME.toUpperCase()}</h1>
<p><strong>Contenedor:</strong> ${hostname}</p><p><strong>Peticiones locales:</strong> #${requestCounter}</p>
<p><strong>Estudiante:</strong> Ernesto Moreno Ceron</p>
<button onclick="location.reload()" style="background:${INSTANCE_COLOR};color:#fff;border:none;padding:.7rem 1.4rem;border-radius:8px;cursor:pointer;font-weight:bold">Recargar (Probar Balanceo)</button>
</div></body></html>`);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', instance: INSTANCE_NAME }));
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });
app.listen(PORT, '0.0.0.0', () => console.log(`[${INSTANCE_NAME}] Escuchando en puerto ${PORT}`));
