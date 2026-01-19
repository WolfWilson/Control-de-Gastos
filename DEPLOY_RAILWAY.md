# 🚀 Deploy PWA "Control de Gastos" en Railway

## 📋 Pre-requisitos

### 1. Código en GitHub
```bash
# Asegúrate que todo esté committeado y pusheado
git add .
git commit -m "Ready for Railway deploy"
git push origin main
```

---

## 🎯 Deploy en Railway (Método Simplificado)

### Paso 1: Crear Proyecto
1. Ve a [railway.app](https://railway.app)
2. Login con tu cuenta de GitHub
3. Click **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Selecciona tu repositorio `Control-de-Gastos`

Railway detectará automáticamente Python y el `railway.toml`.

### Paso 2: Configurar Root Directory
**⚠️ IMPORTANTE**: Debes decirle a Railway que trabaje desde la carpeta `backend`.

1. Click en la **tarjeta de tu servicio** (aparecerá en el canvas)
2. Ve a la pestaña **Settings** (arriba)
3. Busca la sección **"Source Repo"** (en la parte superior del panel)
4. Haz click en el enlace pequeño: **"Configure"** o **"Add Root Directory"**
5. En el campo que aparece, escribe: `backend`
6. Click **Save** o presiona Enter

Esto le dice a Railway que use `backend/` como directorio raíz del proyecto.

### Paso 3: Verificar Comando de Inicio
Railway debería detectar automáticamente el comando desde `Procfile`, pero verifica:

1. En **Settings**, busca en el menú derecho la opción **"Deploy"**
2. Verifica que el **Start Command** sea:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Si no está, agrégalo manualmente

### Paso 4: Variables de Entorno (Opcional)
1. Ve a la pestaña **Variables**
2. Railway automáticamente setea `PORT`
3. Opcionalmente puedes agregar:
   - `PYTHONUNBUFFERED=1` (para ver logs en tiempo real)

**No necesitas SECRET_KEY ni passwords** - esta app no los usa.

### Paso 5: Generar Dominio Público
1. En **Settings**, ve al menú derecho
2. Click en **"Networking"**
3. En la sección "Public Networking", click **"Generate Domain"**
4. Railway te dará una URL tipo:
   ```
   https://control-de-gastos-production.up.railway.app
   ```

### Paso 6: Esperar el Deploy
Railway:
1. Detectará el `requirements.txt` en `backend/`
2. Instalará las dependencias Python
3. Ejecutará el comando del Procfile
4. Tu app estará disponible en la URL generada

---

## ✅ Verificación del Deploy

### 1. Revisar Logs
En la pestaña **Deployments**:
- Deberías ver: `Application startup complete`
- Deberías ver: `Uvicorn running on http://0.0.0.0:XXXX`

### 2. Probar la App
1. Abre la URL generada en Chrome/Edge
2. Deberías ver la pantalla de **Login/Registro**
3. Registra un usuario nuevo
4. Agrega un gasto de prueba
5. Verifica que se guarde correctamente

### 3. Probar Offline
1. En DevTools (F12) → **Application** → **Service Workers**
2. Verifica que el Service Worker esté **activated**
3. Desconecta el WiFi
4. Recarga la página
5. Debería seguir funcionando (datos en IndexedDB)

### 4. Instalar como PWA

**En Android (Chrome):**
- Chrome mostrará automáticamente "Agregar a pantalla de inicio"
- O en el menú: "Instalar aplicación"

**En iOS (Safari):**
- Botón "Compartir" → "Agregar a pantalla de inicio"

**En Desktop (Chrome/Edge):**
- Ícono de "+" en la barra de direcciones
- O menú → "Instalar Control de Gastos"

---

## 📁 Estructura del Proyecto (Para Railway)

Railway espera esta estructura con Root Directory en `backend/`:

```
Control-de-Gastos/
├── backend/                    ← Root Directory en Railway
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py            ← Sirve el frontend
│   ├── requirements.txt        ← Railway instala desde aquí
│   └── Procfile               ← (Opcional) Comando de inicio
├── frontend/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── css/
│   └── js/
├── railway.toml               ← Configuración de Railway
└── requirements.txt           ← (Raíz, opcional)
```

---

## 🔧 Comandos Útiles

### Ver logs en tiempo real
Desde tu proyecto en Railway:
- Pestaña **Deployments** → Click en el último deploy
- Los logs se actualizan automáticamente

### Redeployar manualmente
Si haces cambios en GitHub:
```bash
git add .
git commit -m "Update PWA"
git push
```
Railway detectará el push y redeployará automáticamente.

### Forzar redeploy sin cambios
En Railway:
- **Deployments** → Click en los 3 puntos del último deploy
- Click **"Redeploy"**

---

## 🐛 Troubleshooting

### Error: "No module named 'app'"
**Solución**: Verifica que Root Directory esté configurado en `backend`.

### Error: "Address already in use"
**Solución**: Railway maneja el PORT automáticamente. Asegúrate que tu `main.py` use:
```python
# Ya está configurado así, pero verifica:
# En Procfile: --port $PORT
# Railway setea la variable PORT automáticamente
```

### Frontend no carga (404 en assets)
**Solución**: Verifica que `backend/app/main.py` tenga las rutas correctas:
```python
frontend_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
    "frontend"
)
```

### Service Worker no se registra
- ✅ Railway da HTTPS automáticamente (requerido para Service Workers)
- Verifica en DevTools → Application → Service Workers
- Puede tardar 1-2 minutos en la primera carga

### App muy lenta
Railway puede hibernar apps en el plan gratuito:
- Primera carga puede tardar 5-10 segundos
- Cargas subsecuentes son rápidas
- Considera el Hobby plan ($5/mes) para mantenerla siempre activa

---

## 📊 Límites del Plan Gratuito (Railway)

**Trial Plan** (gratis con GitHub):
- ✅ $5 de crédito gratuito mensual
- ✅ Suficiente para 1-2 apps pequeñas
- ✅ HTTPS automático
- ✅ Auto-deploy desde GitHub
- ⚠️ Puede hibernar por inactividad

**Hobby Plan** ($5/mes):
- ✅ $5 de crédito + $5 extras incluidos
- ✅ Sin hibernación automática
- ✅ Mejor para apps en producción

Tu PWA es muy liviana y consume pocos recursos (solo sirve archivos estáticos).

---

## 🎉 Después del Deploy

### 1. Compartir la App
Tu URL será algo como:
```
https://control-de-gastos-production.up.railway.app
```

Puedes compartirla con amigos/familia para que la usen.

### 2. Personalizar Dominio (Opcional)
Si tienes un dominio propio:
1. Railway → Settings → Domains
2. Add Custom Domain
3. Configura DNS según las instrucciones
4. Tu app estará en `https://misfinanzas.tudominio.com`

### 3. Monitoreo
En Railway dashboard:
- **Metrics**: CPU, RAM, ancho de banda
- **Deployments**: Historial de deploys
- **Variables**: Gestión de variables de entorno

---

## 📝 Notas Importantes

1. **Sin base de datos externa**: Tu app usa IndexedDB en el navegador, no necesita PostgreSQL ni Redis.

2. **Sin CORS complicado**: Todo se sirve desde el mismo dominio (backend sirve el frontend), no hay problemas de CORS.

3. **Auto-deploy**: Cada `git push` a `main` redeploya automáticamente.

4. **Datos del usuario**: Se guardan en el navegador del usuario (IndexedDB), no en el servidor.

5. **Backups**: Los usuarios pueden exportar sus datos (botón en el menú).

---

¡Listo! Tu PWA debería estar corriendo en Railway. 🚀

**Siguiente paso**: Si Railway no funciona por límites, continúa con [DEPLOY_FLYIO.md](DEPLOY_FLYIO.md).
