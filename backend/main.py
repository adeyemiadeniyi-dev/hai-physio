from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routes import sessions, coaching

# Create FastAPI app
app = FastAPI(
    title="Hai-Physio API",
    description="AI-powered physiotherapy service for low-resource settings",
    version="1.0.0"
)

# Configure CORS - allow all origins for MVP (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(sessions.router)
app.include_router(coaching.router)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Hai-Physio API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "sessions": "/sessions",
            "coaching": "/coaching",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "api": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
