from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(
    title="Control de Gastos API",
    description="API backend para la aplicación de control de gastos",
    version="1.0.0"
)

# CORS - Permitir acceso desde cualquier origen durante desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the absolute path to the frontend directory
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")

# Serve static files from frontend directory
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")
app.mount("/css", StaticFiles(directory=os.path.join(frontend_path, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(frontend_path, "js")), name="js")

@app.get("/")
async def read_root():
    """Serve the main index.html page"""
    index_path = os.path.join(frontend_path, "index.html")
    return FileResponse(index_path)

@app.get("/manifest.json")
async def manifest():
    """Serve the PWA manifest"""
    manifest_path = os.path.join(frontend_path, "manifest.json")
    return FileResponse(manifest_path, media_type="application/json")

@app.get("/sw.js")
async def service_worker():
    """Serve the service worker with correct MIME type"""
    sw_path = os.path.join(frontend_path, "sw.js")
    return FileResponse(sw_path, media_type="application/javascript")

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {"status": "healthy", "message": "API is running"}

# API routes (add your actual API endpoints here if needed)
@app.get("/api/version")
async def get_version():
    return {"version": "1.0.0", "app": "Control de Gastos"}
