from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from config import APP_NAME, APP_VERSION, FRONTEND_URL, AI_PROVIDER
from routes.auth_routes import router as auth_router
from routes.vocab_routes import router as vocab_router
from routes.quiz_routes import router as quiz_router
from routes.wordbank_routes import router as wordbank_router
from routes.user_routes import router as user_router

# initialize fastapi app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="AI-powered vocabulary enhancement system for students"
)

# cors middleware - allows frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register all route modules
app.include_router(auth_router)
app.include_router(vocab_router)
app.include_router(quiz_router)
app.include_router(wordbank_router)
app.include_router(user_router)


@app.on_event("startup")
async def startup():
    """create database tables on startup"""
    init_db()
    print(f"\n{'='*50}")
    print(f"  {APP_NAME} v{APP_VERSION}")
    print(f"  AI Provider: {AI_PROVIDER.upper()}")
    print(f"  Backend running at: http://localhost:8000")
    print(f"  API docs at: http://localhost:8000/docs")
    print(f"{'='*50}\n")


@app.get("/")
async def root():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "ai_provider": AI_PROVIDER,
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "ai_provider": AI_PROVIDER}


# run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
