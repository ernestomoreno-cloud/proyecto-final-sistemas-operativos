import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Rampa de subida a 10 usuarios
    { duration: '25s', target: 30 }, // Carga sostenida de 30 usuarios concurrentes
    { duration: '10s', target: 0 },  // Rampa de enfriamiento
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // El 95% de peticiones debe responder en menos de 200ms
    http_req_failed: ['rate<0.01'],   // Menos del 1% de errores
  },
};

export default function () {
  const res = http.get('http://localhost:8080/', {
    headers: { Accept: 'application/json' },
  });

  check(res, {
    'estado HTTP es 200': (r) => r.status === 200,
    'responde una instancia valida': (r) => r.body.includes('backend-'),
  });

  sleep(0.1);
}
