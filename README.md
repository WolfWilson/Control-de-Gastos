# Control de Gastos PWA

Aplicación web progresiva (PWA) para control de gastos personales con funcionalidad offline.

## 🚀 Deploy Rápido

### Render.com (Recomendado - Gratis)

```bash
# 1. Push a GitHub
git init
git add .
git commit -m "PWA ready"
git remote add origin https://github.com/TU-USUARIO/control-de-gastos.git
git push -u origin main

# 2. Deploy en Render
# Seguir RENDER_DEPLOYMENT.md
```

Ver guía completa: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

### Railway (Alternativa)

Ver guía: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📱 Características

- ✅ PWA instalable (Android/iOS)
- ✅ Funciona 100% offline
- ✅ Sin backend/base de datos remota
- ✅ Datos en IndexedDB local
- ✅ Exportar/Importar datos JSON
- ✅ Service Worker con caché inteligente

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Backend**: FastAPI (sirve frontend estático)
- **Base de Datos**: IndexedDB (local en el navegador)
- **PWA**: Service Worker + Manifest
- **Charts**: Chart.js

## 📂 Estructura

```
├── frontend/          # PWA frontend
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── css/
│   ├── js/
│   └── assets/icons/
├── backend/           # FastAPI server
│   └── app/
│       └── main.py
├── render.yaml        # Config Render
└── requirements.txt
```

## 🔧 Desarrollo Local

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# O simple HTTP server
cd frontend
python -m http.server 3000
```

Abrir: http://localhost:8000

## 📦 Deployment

Todos los archivos necesarios ya están creados:

- ✅ `render.yaml` - Config Render
- ✅ `requirements.txt` - Dependencias
- ✅ `RENDER_DEPLOYMENT.md` - Guía completa

Ver: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🌐 URLs después del deploy

- **App**: `https://control-de-gastos.onrender.com`
- **Health**: `https://control-de-gastos.onrender.com/health`
- **API Docs**: `https://control-de-gastos.onrender.com/docs`

## 📱 Instalar PWA

### Android (Chrome)
1. Abrir app en Chrome
2. Menú → "Instalar aplicación"

### iOS (Safari)
1. Abrir app en Safari
2. Compartir → "Agregar a pantalla de inicio"

## 🔐 Seguridad

- HTTPS automático (Render/Railway)
- Sin datos sensibles en el código
- CORS configurado
- Datos locales en el dispositivo

## 📄 Licencia

MIT

## 👤 Autor

WolfWilson
