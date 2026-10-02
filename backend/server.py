from fastapi import FastAPI, APIRouter, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create upwards directory
UPLOAD_DIR = ROOT_DIR / "uploads"
PROFILES_DIR = UPLOAD_DIR / "profiles"
PROFILES_DIR.mkdir(parents=True, exist_ok=True)

# Import routes
from routes import products, categories, cart, bookings, orders, admin_users, admin_products, admin_orders, user_profile, recommendations
from routes import wishlists, compare, activity_logs, system_configs, recommendation_rules, room_preferences, planner, admin_analytics, smart_suggestions, admin_backup
from auth import router as auth_router
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.backup_service import perform_backup
from services.archival_service import archive_completed_orders

# MongoDB connection
from database import get_database

db = get_database()

# Create the main app
app = FastAPI(title="SmartFurni API", version="1.0.0")

# Custom Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin")
    method = request.method
    url = str(request.url)
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    try:
        with open(ROOT_DIR / "server_log.txt", "a") as f:
            f.write(f"Request: {method} {url} | Origin: {origin} | Status: {response.status_code} | Time: {process_time:.4f}s\n")
    except Exception as e:
        print(f"Logging error: {e}")
        logging.error(f"Request: {method} {url} | Origin: {origin} | Status: {response.status_code} | Time: {process_time:.4f}s")
    
    return response

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "SmartFurni API v2 is running", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Include all route modules
api_router.include_router(admin_users.router, prefix="/admin/users", tags=["admin_users"])
api_router.include_router(admin_products.router, prefix="/admin/products", tags=["admin_products"])
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin_orders"])
api_router.include_router(admin_analytics.router, prefix="/admin/analytics", tags=["admin_analytics"])
api_router.include_router(admin_backup.router, prefix="/admin/backup", tags=["admin_backup"])
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(cart.router)
api_router.include_router(bookings.router)
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(user_profile.router, prefix="/user/profile", tags=["user_profile"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(wishlists.router, prefix="/wishlists", tags=["wishlists"])
api_router.include_router(compare.router, prefix="/compare", tags=["compare"])
api_router.include_router(activity_logs.router, prefix="/activity_logs", tags=["activity_logs"])
api_router.include_router(system_configs.router, prefix="/system-configs", tags=["system_configs"])
api_router.include_router(recommendation_rules.router, prefix="/recommendation_rules", tags=["recommendation_rules"])
api_router.include_router(room_preferences.router, prefix="/room_preferences", tags=["room_preferences"])
api_router.include_router(planner.router, prefix="/planner", tags=["planner"])
api_router.include_router(smart_suggestions.router, prefix="/smart-suggestions", tags=["smart_suggestions"])

# Include the router in the main app
app.include_router(api_router)

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3007",
    "http://localhost:4011",
    "http://localhost:4030",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3007",
    "http://127.0.0.1:4011",
    "http://127.0.0.1:4030",
]

# Add origins from env if present
env_origins = os.environ.get('CORS_ORIGINS', '').split(',')
for o in env_origins:
    if o: origins.append(o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(ROOT_DIR / "uploads")), name="uploads")

# Background Scheduler
scheduler = AsyncIOScheduler()

from database import get_database, wait_for_mongodb

@app.on_event("startup")
async def startup_event():
    # Wait for MongoDB to be ready
    is_ready = await wait_for_mongodb()
    if not is_ready:
        print("Backend starting without MongoDB (check if mongod is running!)")
    
    # Start scheduler
    # Job 1: Daily Backup (00:00)
    scheduler.add_job(perform_backup, 'cron', hour=0, minute=0)
    
    # Job 2: Order Archival (Every Hour)
    # This runs the archival logic which checks for orders completed > 24h ago
    scheduler.add_job(archive_completed_orders, 'interval', hours=1, args=[db])
    
    scheduler.start()
    logging.info("Background scheduler started with backup and archival jobs.")

@app.on_event("shutdown")
async def shutdown_scheduler():
    scheduler.shutdown()
    logging.info("Background scheduler shut down.")










