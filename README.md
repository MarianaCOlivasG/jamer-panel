# JAMER Dashboard - Angular Docker Setup

Este proyecto cuenta con una configuración avanzada de Docker que permite inyectar variables de entorno de forma dinámica durante la construcción de la imagen. Esto evita tener que modificar manualmente los archivos `environment.ts`.

## 🚀 Tecnologías
- **Angular 15**
- **Docker** (Multi-stage build)
- **Nginx** (Servidor de producción)
- **GitHub Actions** (CI/CD)

---

## 🛠️ Configuración Local con Docker

### 1. Requisitos
- Docker y Docker Compose instalados.
- Node.js (opcional, solo para pruebas locales del script de inyección).

### 2. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en el ejemplo:
```bash
cp .env.example .env
```
Edita el archivo `.env` con las URLs de tu API y WebSockets.

### 3. Levantar con Docker Compose
El archivo `docker-compose.yml` está configurado para descargar la imagen pre-construida desde DockerHub (`marianaolivas/jamer-dashboard`).

```bash
docker-compose up -d
```
La aplicación estará disponible en `http://localhost:80`.


---

## 🏗️ Construcción Manual de la Imagen

Si prefieres construir la imagen manualmente sin Docker Compose, debes pasar los `build-args`:

```bash
docker build \
  --build-arg API_URL="https://tu-api.com/api" \
  --build-arg WS_SERVER="https://tu-api.com" \
  -t jamer-dashboard:latest .
```

---

## 🤖 CI/CD con GitHub Actions

El proyecto incluye un workflow automatizado en `.github/workflows/docker.yml`.

### Configuración de Secretos en GitHub
Para que el despliegue funcione, añade estos secretos en **Settings > Secrets and variables > Actions**:

| Secreto | Descripción |
| --- | --- |
| `DOCKER_USERNAME` | Tu usuario de DockerHub |
| `DOCKER_PASSWORD` | Tu Access Token de DockerHub |
| `API_URL` | URL de la API para producción |
| `WS_SERVER` | URL de WebSockets para producción |

---

## 🔍 ¿Cómo funciona la inyección dinámica?

Angular compila todo el código a archivos estáticos (JS/CSS). Para permitir variables dinámicas:
1.  **Stage 1 (Build)**: El Dockerfile usa `replace-env.js` para leer las variables del sistema e inyectarlas en `src/environments/environment.ts`.
2.  **Compilación**: Se ejecuta `ng build --configuration production` con los valores ya inyectados.
3.  **Stage 2 (Serve)**: Los archivos resultantes se copian a una imagen ligera de Nginx.

Esto garantiza que una misma base de código pueda generar imágenes para diferentes entornos (Dev, Staging, Prod) simplemente cambiando los argumentos del build.
