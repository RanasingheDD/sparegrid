from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = "https://ixebixsdfmhtbwghvzkm.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZWJpeHNkZm1odGJ3Z2h2emttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODM4NDQsImV4cCI6MjA4OTU1OTg0NH0.Mr2NstMwMupy59uCQ1IiGUUNQS1o9PJozBVMDXGbc9w"
    SECRET_KEY: str = "sb_publishable_xY94WOnjPCvZfOu2_RRQNg_lBjGfw7N"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Cloudinary Integration
    CLOUDINARY_CLOUD_NAME: str = "dnco9oaqj"
    CLOUDINARY_API_KEY: str = "398986981647894"
    CLOUDINARY_API_SECRET: str = "hftHAMVwaGXdc24lXSWgL9-FiZ8"

    class Config:
        env_file = ".env"

settings = Settings()
