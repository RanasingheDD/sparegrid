from supabase import create_client, Client
from app.config import settings

def init_supabase() -> Client:
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    return create_client(url, key)

db: Client = init_supabase()

def get_db() -> Client:
    yield db
