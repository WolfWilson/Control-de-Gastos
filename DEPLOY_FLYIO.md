# 🚀 Deploy PWA "Control de Gastos" en Fly.io

## 📋 Pre-requisitos

### 1. Instalar Fly.io CLI

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Verificar instalación:**
```powershell
flyctl version
```

### 2. Crear cuenta y login
```bash
# Crear cuenta en fly.io (gratis hasta 3 apps)
flyctl auth signup

# O si ya tienes cuenta
flyctl auth login
```

---

## 🎯 Preparar el Proyecto

### 1. Verificar estructura
Tu proyecto debe tener esta estructura:
```
Control-de-Gastos/
├── backend/
│   ├── app/
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── manifest.json
├── Procfile (opcional)
└── requirements.txt (raíz)
```

### 2. Crear `fly.toml` en la raíz del proyecto

Fly.io necesita un archivo de configuración. Crea `fly.toml` en la raíz:

```toml
# fly.toml
app = "control-de-gastos"  # Cambia esto por un nombre único

[build]
  # Fly.io construirá la imagen desde la raíz

[env]
  PORT = "8080"
  PYTHONUNBUFFERED = "1"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### 3. Crear `Dockerfile` en la raíz

Fly.io usa Docker. Crea este archivo en la raíz del proyecto:

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código
COPY backend ./backend
COPY frontend ./frontend

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar la app
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 4. Crear `.dockerignore` en la raíz

```
# .dockerignore
.git
.gitignore
__pycache__
*.pyc
*.pyo
*.pyd
.Python
venv/
env/
.env
.vscode/
.idea/
*.md
!README.md
.DS_Store
```

---

## 🚀 Deploy

### Paso 1: Inicializar app en Fly.io

Desde la **raíz del proyecto**:

```bash
flyctl launch
```

Fly.io te preguntará:
- ✅ **App name**: `control-de-gastos` (o el que prefieras, debe ser único)
- ✅ **Region**: Elige la más cercana (ej: `mia` - Miami, `gru` - São Paulo)
- ❌ **PostgreSQL database**: `No` (no necesitas, usas IndexedDB)
- ❌ **Redis**: `No`

Fly.io detectará el `Dockerfile` y creará el `fly.toml` automáticamente.

### Paso 2: Deploy inicial

```bash
flyctl deploy
```

Esto:
1. Construye la imagen Docker
2. Sube la imagen a Fly.io
3. Inicia tu app
4. Te da una URL pública

### Paso 3: Obtener URL

```bash
flyctl status
```

O visita directamente:
```
https://control-de-gastos.fly.dev
```
(Reemplaza `control-de-gastos` con el nombre que elegiste)

---

## 🔧 Comandos Útiles

### Ver logs en tiempo real
```bash
flyctl logs
```

### Ver estado de la app
```bash
flyctl status
```

### Abrir la app en el navegador
```bash
flyctl open
```

### Ver todas tus apps
```bash
flyctl apps list
```

### Escalar recursos (si necesitas más)
```bash
flyctl scale memory 512  # Aumentar RAM
flyctl scale count 1     # Número de instancias
```

### Destruir la app (eliminar completamente)
```bash
flyctl apps destroy control-de-gastos
```

---

## ✅ Checklist de Deploy

- [ ] Fly.io CLI instalado (`flyctl version`)
- [ ] Login en Fly.io (`flyctl auth login`)
- [ ] `Dockerfile` creado en la raíz
- [ ] `fly.toml` creado en la raíz
- [ ] `.dockerignore` creado
- [ ] `flyctl launch` ejecutado
- [ ] `flyctl deploy` completado exitosamente
- [ ] App accesible en `https://TU-APP.fly.dev`
- [ ] Login/Registro funciona
- [ ] Gastos se guardan correctamente
- [ ] App funciona offline (después de primera carga)
- [ ] Instalable como PWA en móvil

---

## 🎉 Probar la PWA

### Desktop
1. Abre `https://control-de-gastos.fly.dev` en Chrome/Edge
2. Verás un ícono de "instalar" en la barra de direcciones
3. Click para instalar como app de escritorio

### Android
1. Abre la URL en Chrome
2. Menú → "Agregar a pantalla de inicio"
3. La app se instalará como app nativa

### iOS
1. Abre la URL en Safari
2. Botón "Compartir" → "Agregar a pantalla de inicio"
3. La app se instalará como app nativa

---

## 🐛 Troubleshooting

### Error: "App name already taken"
```bash
# En fly.toml, cambia el nombre:
app = "control-gastos-tu-nombre"  # Debe ser único globalmente
```

### Error: "Failed to build"
```bash
# Verifica que requirements.txt esté en la raíz
# Debe contener:
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
```

### Service Worker no se registra
- Fly.io da HTTPS automáticamente ✅
- Verifica en DevTools → Application → Service Workers
- Puede tardar 1-2 minutos en la primera carga

### App muy lenta
```bash
# Aumenta la memoria (plan gratuito permite hasta 256MB)
flyctl scale memory 256
```

### Ver logs detallados
```bash
flyctl logs --follow  # Logs en tiempo real
```

---

## 💰 Límites del Plan Gratuito

Fly.io Free Tier incluye:
- ✅ 3 apps compartidas (1 CPU, 256MB RAM)
- ✅ 160GB tráfico mensual
- ✅ HTTPS automático
- ✅ Auto-sleep después de inactividad (ahorra recursos)

Tu PWA es perfecta para el plan gratuito porque:
- Solo sirve archivos estáticos
- No usa base de datos externa
- Tiene consumo mínimo de recursos

---

## 📝 Notas Importantes

1. **Primera carga puede ser lenta**: La app se "duerme" después de inactividad. La primera petición la "despierta".

2. **Auto-sleep**: Con `min_machines_running = 0`, la app se apaga si no hay tráfico. Esto ahorra recursos del plan gratuito.

3. **Sin base de datos**: No necesitas PostgreSQL ni Redis porque tu app usa IndexedDB en el navegador.

4. **HTTPS incluido**: Fly.io da certificados SSL automáticamente.

5. **Actualizar la app**:
   ```bash
   git add .
   git commit -m "Update"
   flyctl deploy  # No necesitas git push
   ```

---

¡Listo! Tu PWA debería estar corriendo en Fly.io. 🚀
