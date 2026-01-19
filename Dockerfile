# Dockerfile para PWA Control de Gastos
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código
COPY backend ./backend
COPY frontend ./frontend

# Exponer el puerto (Fly.io usa 8080 internamente)
EXPOSE 8080

# Comando para iniciar la app
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
