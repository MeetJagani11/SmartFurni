from database import get_database

db = get_database()

async def log_activity_bg(activity: dict):
    """Background task to save activity without blocking request."""
    await db.activity_logs.insert_one(activity)
