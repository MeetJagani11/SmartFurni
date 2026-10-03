from pathlib import Path
import os
from dotenv import load_dotenv

# Ensure .env is loaded if auth config is imported before server entrypoint
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / '.env')

SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = "HS256"

if not SECRET_KEY or not SECRET_KEY.strip():
    raise RuntimeError(
        "JWT_SECRET environment variable is missing or empty. "
        "Please set JWT_SECRET in your environment or backend/.env file."
    )
