import os
import subprocess
from datetime import datetime
from pathlib import Path
import logging
import json
import asyncio
import shutil
from bson import json_util
from database import get_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BACKUP_DIR = Path("backups")
BACKUP_DIR.mkdir(exist_ok=True)

async def perform_backup():
    """
    Performs a database backup. Tries mongodump first, falls back to JSON export.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"backup_{timestamp}"
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://127.0.0.1:27017')
    db_name = os.environ.get('DB_NAME', 'smartfurni')
    
    # Try mongodump first (Subprocess)
    try:
        command = [
            "mongodump",
            f"--uri={mongo_url}",
            f"--db={db_name}",
            f"--out={backup_file}"
        ]
        logger.info(f"Starting mongodump to {backup_file}")
        
        # Run subprocess in executor to avoid blocking main loop
        result = await asyncio.to_thread(subprocess.run, command, check=True, capture_output=True)
        logger.info("mongodump completed successfully")
        cleanup_old_backups()
        return str(backup_file.name)
    except (subprocess.CalledProcessError, FileNotFoundError, Exception) as e:
        logger.warning(f"mongodump failed or not found, falling back to JSON export: {str(e)}")
        # Fallback to Python-based JSON export (Async)
        return await perform_backup_json(backup_file)

async def perform_backup_json(backup_path: Path):
    """
    Export all collections to JSON files using motor.
    """
    try:
        db = get_database()
        backup_path.mkdir(exist_ok=True)
        collections = await db.list_collection_names()
        
        for coll_name in collections:
            cursor = db[coll_name].find()
            docs = await cursor.to_list(length=None)
            
            # Use to_thread for file I/O to stay responsive
            def write_json():
                with open(backup_path / f"{coll_name}.json", 'w') as f:
                    json.dump(docs, f, default=json_util.default)
            
            await asyncio.to_thread(write_json)
        
        # Add a marker file to indicate it's a JSON backup
        def write_marker():
            with open(backup_path / ".json_backup", 'w') as f:
                f.write("true")
        
        await asyncio.to_thread(write_marker)
            
        logger.info(f"JSON backup completed successfully: {backup_path.name}")
        cleanup_old_backups()
        return str(backup_path.name)
    except Exception as e:
        logger.error(f"JSON backup failed: {str(e)}")
        return None

async def restore_backup(backup_name: str):
    """
    Restores the database. Checks if it's a mongodump or JSON backup.
    """
    backup_path = BACKUP_DIR / backup_name
    if not backup_path.exists():
        logger.error(f"Backup {backup_name} not found")
        return False
        
    # Check if it's a JSON backup
    if (backup_path / ".json_backup").exists():
        return await restore_backup_json(backup_path)
        
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://127.0.0.1:27017')
    db_name = os.environ.get('DB_NAME', 'smartfurni')
    actual_data_path = backup_path / db_name
    
    try:
        command = [
            "mongorestore",
            f"--uri={mongo_url}",
            "--drop",
            f"--db={db_name}",
            str(actual_data_path)
        ]
        logger.info(f"Starting mongorestore from {backup_path}")
        await asyncio.to_thread(subprocess.run, command, check=True, capture_output=True)
        logger.info("mongorestore completed successfully")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, Exception) as e:
        logger.error(f"mongorestore failed: {str(e)}")
        return False

async def restore_backup_json(backup_path: Path):
    """
    Restore all collections from JSON files using motor.
    """
    try:
        db = get_database()
        for file in backup_path.glob("*.json"):
            coll_name = file.stem
            
            def read_json():
                with open(file, 'r') as f:
                    return json.load(f, object_hook=json_util.object_hook)
            
            docs = await asyncio.to_thread(read_json)
            
            # Drop current collection
            await db[coll_name].drop()
            # Insert docs if any
            if docs:
                await db[coll_name].insert_many(docs)
        return True
    except Exception as e:
        logger.error(f"JSON restore failed: {str(e)}")
        return False

def cleanup_old_backups():
    all_backups = sorted(BACKUP_DIR.glob("backup_*"), key=os.path.getmtime)
    if len(all_backups) > 7:
        for old_backup in all_backups[:-7]:
            logger.info(f"Removing old backup: {old_backup}")
            if old_backup.is_dir():
                shutil.rmtree(old_backup)
            else:
                os.remove(old_backup)

def list_backups():
    """
    Lists all available backups with metadata.
    """
    backups = []
    if not BACKUP_DIR.exists():
        return []
        
    for item in BACKUP_DIR.iterdir():
        if item.is_dir() and item.name.startswith("backup_"):
            try:
                stats = item.stat()
                backups.append({
                    "name": item.name,
                    "created_at": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                    "size": sum(f.stat().st_size for f in item.glob('**/*') if f.is_file())
                })
            except Exception:
                continue
    return sorted(backups, key=lambda x: x["created_at"], reverse=True)
