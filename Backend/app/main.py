from fastapi import FastAPI
from .db import Base, engine

def create_app() -> FastAPI:
    app = FastAPI(
        title="Auth2FA",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    @app.on_event("startup")
    def on_startup():
        # Cria as tabelas no banco de dados
        Base.metadata.create_all(bind=engine)

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok"}

    from .api import auth, files
    app.include_router(auth.router)
    app.include_router(files.router)
    return app

app = create_app()