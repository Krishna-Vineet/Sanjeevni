"""
Sanjeevni Hospital Network OS — FastAPI Application Entry Point.

Registers all route modules and initializes the database on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables
from .routes import transfer, hospital, resource, ai_router, admin, system, auth

app = FastAPI(
    title="Sanjeevni API",
    description="Hospital Network OS — Real-time patient transfer coordination, "
                "resource exchange, and AI-assisted medical decisions.",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Create database tables on first run."""
    create_tables()


@app.get("/", tags=["Health"])
def read_root():
    return {"message": "Sanjeevni Hospital OS API — Online", "version": "1.0.0"}


# ── Register Routers ──────────────────────────────
app.include_router(auth.router)         # /api/auth/*
app.include_router(transfer.router)    # /api/transfer/*
app.include_router(hospital.router)    # /api/hospital/*
app.include_router(resource.router)    # /api/resource/*
app.include_router(ai_router.router)   # /api/ai/*
app.include_router(admin.router)       # /api/admin/*
app.include_router(system.router)      # /api/hospitals/nearby, /api/dev/seed


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
