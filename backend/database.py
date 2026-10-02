from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import time
import asyncio

_client = None

def get_database():
    """
    Get database connection (Singleton) with retry logic
    """
    global _client
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://127.0.0.1:27017')
    db_name = os.environ.get('DB_NAME', 'smartfurni')
    
    if _client is None:
        print(f"Connecting to MongoDB at {mongo_url}...")
        _client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    
    # We don't perform a blocking check here because it's an async client
    # and this function is likely called in sync contexts during module load.
    # However, the AsyncIOMotorClient will handle connection management.
    
    return _client[db_name]

async def wait_for_mongodb(max_retries=10, delay=2):
    """
    Utility to wait for MongoDB to be responsive
    """
    db = get_database()
    for i in range(max_retries):
        try:
            # The 'ping' command is the cheapest way to check connection
            await db.command('ping')
            print("Successfully connected to MongoDB.")
            return True
        except Exception as e:
            print(f"Waiting for MongoDB... (Attempt {i+1}/{max_retries})")
            await asyncio.sleep(delay)
    
    print("Could not connect to MongoDB after multiple attempts.")
    return False
