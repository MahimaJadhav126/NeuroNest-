from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, activity

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroNest API", version="1.0.0", description="Evidence-informed digital wellbeing academic MVP")

origins = [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(activity.router)

@app.get("/")
def root():
    return {"name": "NeuroNest API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}
