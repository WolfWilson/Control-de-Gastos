# Guía de Deployment en Railway

## 📦 Preparación Completada

### ✅ PWA Configuración

- [X] `manifest.json` creado
- [X] Íconos PWA generados (192x192, 512x512)
- [X] Apple touch icon configurado
- [X] Meta tags PWA añadidos
- [X] Service Worker configurado

### ✅ Backend FastAPI

- [X] Configurado para servir frontend
- [X] CORS habilitado
- [X] Health check endpoint
- [X] Static files routing

## 🚀 Pasos para Deploy en Railway

### 1. Preparar GitHub

```bash
# En la carpeta raíz del proyecto
git init
git add .
git commit -m "Initial commit - PWA ready for deployment"

# Crear repo en GitHub y pushearlo
git remote add origin https://github.com/TU-USUARIO/control-de-gastos.git
git branch -M main
git push -u origin main
```

### 2. Deploy en Railway

1. **Ir a [Railway.app](https://railway.app/)**
2. **Login** con GitHub
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Seleccionar** tu repositorio `control-de-gastos`
5. **Railway detectará automáticamente** Python y usará el `railway.toml`

### 3. Configurar Variables de Entorno

En Railway dashboard → Variables:

```
PORT=8000
PYTHONUNBUFFERED=1
```

### 4. Obtener URL

Railway te dará una URL tipo:

```
https://control-de-gastos-production.up.railway.app
```

### 5. Testing PWA

#### En Android:

1. Abrir Chrome
2. Ir a tu URL de Railway
3. Chrome mostrará "Instalar app" en el menú
4. Click "Instalar"

#### En iOS:

1. Abrir Safari
2. Ir a tu URL de Railway
3. Botón "Compartir" → "Agregar a pantalla de inicio"

## 🔧 Troubleshooting

### Service Worker no carga

```javascript
// Verificar en DevTools → Application → Service Workers
// Debe mostrar estado "activated"
```

### Manifest no detectado

```bash
# Verificar que manifest.json sea accesible
curl https://TU-URL/manifest.json
```

### Backend no sirve frontend

```bash
# Verificar en logs de Railway
# Debe mostrar: "Application startup complete"
```

## 📱 Test Checklist

- [ ] App se instala en Android
- [ ] App se instala en iOS
- [ ] Funciona offline
- [ ] Íconos se ven correctamente
- [ ] Theme color correcto
- [ ] Splash screen aparece
- [ ] Service Worker activo

## 🎯 URLs Importantes

- **App URL**: `https://control-de-gastos-production.up.railway.app`
- **Health Check**: `https://TU-URL/health`
- **Manifest**: `https://TU-URL/manifest.json`
- **Service Worker**: `https://TU-URL/sw.js`

## 🔐 Seguridad para Producción

Después del primer deploy, actualizar `main.py`:

```python
# Cambiar CORS
allow_origins=["https://TU-DOMINIO.up.railway.app"]
```

## 📊 Monitoring

Railway dashboard proporciona:

- ✅ Logs en tiempo real
- ✅ Métricas de CPU/RAM
- ✅ Deploy history
- ✅ Auto-redeploy en push a main
