# 🚀 Guía de Deployment en Render - PWA Control de Gastos

## 📋 Información Actualizada - Enero 2026

**Render.com** es una plataforma moderna de hosting que ofrece:
- ✅ **Plan gratuito** para proyectos personales
- ✅ Auto-deploy desde GitHub
- ✅ HTTPS automático
- ✅ Perfecto para PWAs
- ⚠️ El tier gratuito "hiberna" después de 15 minutos de inactividad

---

## 🎯 Arquitectura de Deployment

Vamos a usar **1 solo servicio** que sirve tanto el backend (FastAPI) como el frontend (PWA):

```
┌─────────────────────────────────┐
│   Render Web Service            │
│                                 │
│  FastAPI Backend                │
│    ├── Sirve API endpoints      │
│    ├── Sirve frontend estático  │
│    ├── Sirve manifest.json      │
│    └── Sirve service worker     │
└─────────────────────────────────┘
```

---

## 📁 Archivos de Configuración Necesarios

### 1. `render.yaml` (Blueprint)

Crea este archivo en la **raíz** del proyecto:

```yaml
services:
  - type: web
    name: control-de-gastos
    env: python
    region: oregon
    plan: free
    branch: main
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PORT
        value: 8000
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: PYTHONUNBUFFERED
        value: 1
```

### 2. `requirements.txt` (ya creado)

Verificar que existe en la raíz:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
```

### 3. `backend/app/main.py` (ya actualizado)

El archivo ya está configurado para servir el frontend. Verifica que incluya:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve static files
app.mount("/assets", StaticFiles(...))
app.mount("/css", StaticFiles(...))
app.mount("/js", StaticFiles(...))

@app.get("/")
async def read_root():
    return FileResponse("frontend/index.html")
```

---

## 🔧 Pasos para Deployment

### Paso 1: Preparar el Repositorio GitHub

```bash
# Desde la carpeta raíz del proyecto
cd "C:\Users\wolfwilson\Downloads\Git\Control de Gastos"

# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "PWA ready for Render deployment"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU-USUARIO/control-de-gastos.git
git branch -M main
git push -u origin main
```

### Paso 2: Crear cuenta en Render

1. Ir a **[https://render.com](https://render.com)**
2. Click en **"Get Started for Free"**
3. **Sign up** con tu cuenta de GitHub
4. Autorizar Render para acceder a tus repositorios

### Paso 3: Crear Web Service

1. **Dashboard** de Render → Click **"New +"** (esquina superior derecha)
2. Seleccionar **"Web Service"**
3. **Connect** con tu repositorio `control-de-gastos`
4. Configurar:

   ```
   Name:           control-de-gastos
   Region:         Oregon (US West) [más cercano a Latinoamérica]
   Branch:         main
   Root Directory: (dejar vacío)
   Runtime:        Python 3
   Build Command:  pip install -r requirements.txt
   Start Command:  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Plan**: Seleccionar **Free** ($0/mes)
6. **Advanced** → Environment Variables:
   
   ```
   PYTHON_VERSION = 3.11.0
   PYTHONUNBUFFERED = 1
   ```

7. Click **"Create Web Service"**

### Paso 4: Esperar el Deploy

- Render comenzará a buildear automáticamente
- Verás los logs en tiempo real
- Tarda 3-5 minutos la primera vez
- Cuando veas **"Your service is live 🎉"** → ¡Listo!

### Paso 5: Obtener URL

Tu app estará disponible en:
```
https://control-de-gastos.onrender.com
```

---

## 📱 Instalar PWA en Dispositivos

### Android (Chrome)

1. Abrir **Chrome** en el celular
2. Ir a `https://control-de-gastos.onrender.com`
3. Menú (⋮) → **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
4. Confirmar instalación
5. ✅ ¡App instalada!

### iOS (Safari)

1. Abrir **Safari** en iPhone/iPad
2. Ir a `https://control-de-gastos.onrender.com`
3. Botón **Compartir** (⬆️)
4. Scroll down → **"Agregar a pantalla de inicio"**
5. Confirmar con **"Agregar"**
6. ✅ ¡App instalada!

---

## 🔍 Verificar PWA

### Checklist PWA

Abre DevTools en Chrome (F12) y ve a **Application**:

- [x] **Manifest**: Debe aparecer tu `manifest.json`
  - Name: "Control de Gastos"
  - Icons: 192x192 y 512x512
  - Theme color: #6366F1

- [x] **Service Worker**: Estado "activated"
  - Archivo: `sw.js`
  - Status: Running

- [x] **Installability**: Chrome debe sugerir "Instalar"

### Test Offline

1. Con la app abierta en el navegador
2. DevTools → Application → Service Workers
3. Check **"Offline"**
4. Recargar página
5. ✅ Debe funcionar sin internet

---

## ⚙️ Configuración Avanzada

### Auto-Deploy desde GitHub

Por defecto, Render hace **auto-deploy** cuando haces push a `main`:

```bash
git add .
git commit -m "nuevo feature"
git push origin main
# Render detecta el push y re-deploya automáticamente
```

### Variables de Entorno

Si necesitas agregar más variables:

1. Dashboard → Tu servicio
2. **Environment** (menú lateral)
3. **Add Environment Variable**
4. Guardar

### Custom Domain (Opcional)

Si tienes un dominio propio:

1. Dashboard → Settings → Custom Domains
2. Agregar dominio
3. Configurar DNS según instrucciones
4. Render provee HTTPS automático

---

## 🐛 Troubleshooting

### ❌ Build Failed

**Error**: `No module named 'backend'`

**Solución**: Verificar estructura de carpetas:
```
Control de Gastos/
├── backend/
│   └── app/
│       └── main.py
├── frontend/
├── requirements.txt
└── render.yaml
```

**Fix**: El start command debe ser:
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

---

### ❌ Service Worker no carga

**Error**: 404 en `/sw.js`

**Verificar** que `main.py` incluya:
```python
@app.get("/sw.js")
async def service_worker():
    sw_path = os.path.join(frontend_path, "sw.js")
    return FileResponse(sw_path, media_type="application/javascript")
```

---

### ❌ Manifest.json no detectado

**Error**: PWA no se puede instalar

**Verificar**:
1. HTML tiene: `<link rel="manifest" href="/manifest.json">`
2. `main.py` sirve manifest:
   ```python
   @app.get("/manifest.json")
   async def manifest():
       manifest_path = os.path.join(frontend_path, "manifest.json")
       return FileResponse(manifest_path, media_type="application/json")
   ```
3. `.gitignore` permite manifest.json:
   ```gitignore
   !manifest.json
   ```

---

### ⚠️ Servicio "hibernando"

**Problema**: En plan Free, después de 15 minutos sin uso, Render "duerme" el servicio.

**Síntomas**:
- Primera carga tarda 30-60 segundos
- Luego funciona normal

**Soluciones**:
1. **Aceptarlo** (es normal en plan Free)
2. **Ping service**: Crear cron job que haga request cada 10 minutos
3. **Upgrade a Starter** ($7/mes) - sin hibernación

---

## 📊 Monitoreo

### Logs en Tiempo Real

Dashboard → **Logs** (menú lateral)
- Ver requests
- Errores de Python
- Deploy logs

### Métricas

Dashboard → **Metrics**
- CPU usage
- Memory
- Response times

---

## 🔐 Seguridad para Producción

### 1. CORS estricto

Actualizar `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://control-de-gastos.onrender.com",
        "https://tu-dominio-custom.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. HTTPS

✅ Render provee HTTPS automático (certificado SSL gratuito)

### 3. Environment Secrets

Para datos sensibles:

Dashboard → Environment → **Add Secret File**

---

## 💡 Tips Pro

### 1. Health Check

Render hace ping a `/health` cada 30 segundos. El endpoint ya existe en `main.py`:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 2. Preview Deploys

Render puede crear **preview URLs** para cada PR:

Settings → **Pull Request Previews** → Enable

### 3. Clone Service

Para staging/testing:

Dashboard → Settings → **Suspend Service** / **Delete Service**

---

## 📱 Test Final PWA

### Android

```
✅ Se instala desde Chrome
✅ Tiene ícono en home screen
✅ Abre fullscreen (sin barra URL)
✅ Funciona offline
✅ Splash screen con theme color
```

### iOS

```
✅ Se instala desde Safari
✅ Tiene ícono en home screen  
✅ Abre fullscreen
✅ Funciona offline
✅ Barra de estado con theme color
```

---

## 🆘 Soporte

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

## 🎉 Checklist Completo

- [ ] Push a GitHub
- [ ] Crear cuenta Render
- [ ] Conectar repo
- [ ] Configurar Web Service
- [ ] Deploy exitoso
- [ ] Abrir URL en navegador
- [ ] Verificar PWA installable
- [ ] Instalar en Android/iOS
- [ ] Test offline functionality
- [ ] ¡Celebrar! 🎊

---

**¿Listo para deployar?** 🚀

Sigue los pasos y en 10 minutos tendrás tu PWA online y funcionando en Render.
