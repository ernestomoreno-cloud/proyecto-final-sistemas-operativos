# Proyecto Final - Sistemas Operativos (UAO)

- **Estudiante:** Ernesto Moreno Cerón
- **Profesor:** Juan Manuel Álvarez Quiñones
- **Asignatura:** Sistemas Operativos

## Arquitectura
Infraestructura containerizada con Docker y Docker Compose:
- **Nginx** como proxy inverso y balanceador de carga (*Round Robin*).
- **3 instancias Backend** en Node.js con métricas en `/metrics`.
- **Nginx Prometheus Exporter** conectado a `stub_status`.
- **cAdvisor** para métricas de CPU, RAM y red por contenedor.
- **Prometheus** y **Grafana** con dashboard preconfigurado.

## Requisitos y Despliegue
1. Tener instalado Docker Desktop, Docker Compose y `k6`.
2. Levantar la infraestructura: `docker compose up -d --build`
3. Verificar contenedores: `docker compose ps`

## URLs de Acceso
- **Aplicación Web (Nginx):** `http://localhost:8080`
- **Prometheus:** `http://localhost:9090`
- **Grafana:** `http://localhost:3000` (usuario: `admin` / clave: `admin`)
- **cAdvisor:** `http://localhost:8082`
- **Nginx Exporter:** `http://localhost:9113/metrics`

## Pruebas de Balanceo y Carga
- Recargar `http://localhost:8080` en el navegador para ver alternar `backend-1`, `backend-2` y `backend-3`.
- Ejecutar prueba de estrés: `k6 run load-test.js`
- Detener contenedores: `docker compose down`
