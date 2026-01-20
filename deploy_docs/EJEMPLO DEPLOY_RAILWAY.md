# 🚀 Guía de Deploy en Railway (Interfaz Actualizada)

## 📋 Índice
1. [Preparación](#preparación)
2. [Deploy del Backend](#deploy-del-backend)
3. [Deploy del Frontend](#deploy-del-frontend)
4. [Conexión Final](#conexión-final)

---

## 1️⃣ Preparación

Asegúrate de haber subido todo tu código a **GitHub** antes de empezar.

```bash
git add .
git commit -m "Listo para deploy"
git push origin main
```

---

## 2️⃣ Deploy del Backend (FastAPI)

### Paso 1: Crear el Servicio
1. En Railway, click **"New Project"** → **"Deploy from GitHub repo"**.
2. Selecciona tu repositorio.
3. Railway intentará hacer un deploy inicial (probablemente falle, no te preocupes).

### Paso 2: Configurar Directorio Raíz (Source)
1. Haz click en la tarjeta de tu servicio.
2. Ve a la pestaña **Settings**.
3. Busca la sección **"Source Repo"** (arriba del todo).
4. Haz click en el enlace pequeño: 👉 **"Add Root Directory"**.
5. Escribe: `backend`
6. Click en **Save** (o Enter).
   * *Esto disparará un nuevo deploy automáticamente.*

### Paso 3: Configurar Comando de Inicio (Deploy)
1. En la misma pestaña **Settings**, mira el menú de la derecha.
2. Haz click en **"Deploy"**.
3. Busca el campo **"Start Command"** (o "Custom Start Command").
4. Escribe:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. El cambio se guarda automáticamente o dale a Save.

### Paso 4: Variables de Entorno
1. Ve a la pestaña **Variables** (arriba, junto a Settings).
2. Click en **"New Variable"**.
3. Agrega:
   - `SECRET_KEY`: (Tu clave generada)
   - `ADMIN_PASSWORD`: (Tu contraseña segura, ej: Hermetica_v8)

### Paso 5: Generar Dominio Público
1. Ve a la pestaña **Settings**.
2. En el menú derecho, click en **"Networking"**.
3. En "Public Networking", click en **"Generate Domain"**.
4. **¡Copia este dominio!** (ej: `web-production-1234.up.railway.app`). Lo necesitarás para el frontend.

### Paso 6: Persistencia (Volumen para archivos)
**IMPORTANTE:** Esto se hace desde el "Lienzo" (la vista principal), no desde Settings.

1. Cierra el panel de configuración (click en la **X** arriba a la derecha).
2. En el lienzo principal, haz **Click Derecho** sobre la tarjeta de tu servicio **Backend**.
3. Selecciona la opción **"Volume"**.
4. Verás que aparece un icono de disco duro conectado a tu servicio.
5. Haz click en ese **Volumen**.
6. En el campo **Mount Path**, escribe: `/app/uploads`
7. Railway redeployará automáticamente para aplicar el cambio.

---

## 3️⃣ Deploy del Frontend (React)

### Paso 1: Crear Servicio Frontend
1. En el mismo proyecto, click en el botón **"+ New"** (o click derecho en el lienzo).
2. Selecciona **"GitHub Repo"**.
3. Selecciona **el mismo repositorio** otra vez.

### Paso 2: Configurar Directorio Raíz
1. Click en la nueva tarjeta (servicio frontend).
2. Ve a **Settings** → **Source Repo** → **"Add Root Directory"**.
3. Escribe: `react-app`
4. Guarda.

### Paso 3: Configurar Comandos
1. Ve a **Settings** → menú derecho **"Build"**.
   - Build Command: `npm run build`
2. Ve a **Settings** → menú derecho **"Deploy"**.
   - Start Command: `npm run preview -- --host --port $PORT`
   * *Nota: Usamos `preview` para probar rápido. Para producción real se recomienda servir los estáticos, pero esto funciona perfecto.*

### Paso 4: Conectar con Backend
1. Ve a la pestaña **Variables**.
2. Agrega:
   - `VITE_API_URL`: `https://TU-DOMINIO-BACKEND.up.railway.app/api`
   * *(Pega aquí el dominio que copiaste en el paso del Backend, asegúrate de agregar `/api` al final)*.

### Paso 5: Generar Dominio Frontend
1. Ve a **Settings** → **Networking**.
2. Click **"Generate Domain"**.
3. ¡Este es el link de tu página web!

---

## 4️⃣ Conexión Final (CORS)

Ahora que tienes el dominio del frontend, debes decirle al backend que confíe en él.

1. Copia el dominio de tu frontend (ej: `https://frontend-production.up.railway.app`).
2. Ve a tu código local, archivo `backend/main.py`.
3. Busca la configuración de CORS y agrégalo:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://TU-DOMINIO-FRONTEND.up.railway.app"  # <--- Agrega esto
    ],
    # ... resto del código
)
```

4. Sube el cambio a GitHub:
```bash
git add .
git commit -m "Configurar CORS producción"
git push
```

5. Railway detectará el cambio y redeployará el backend automáticamente.

---

## ✅ Checklist de Éxito

- [ ] Backend tiene Root Directory: `backend`
- [ ] Backend tiene Start Command con `uvicorn`
- [ ] Backend tiene variables `SECRET_KEY` y `ADMIN_PASSWORD`
- [ ] Frontend tiene Root Directory: `react-app`
- [ ] Frontend tiene variable `VITE_API_URL` apuntando al backend
- [ ] Backend tiene el dominio del Frontend en CORS

¡Listo! Tu app debería estar funcionando en la nube. 🚀
