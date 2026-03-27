from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://webnav:webnav@db:5432/webnav"
    REDIS_URL: str = "redis://redis:6379"
    SECRET_KEY: str = "change-me-in-production-use-long-random-string"
    DEBUG: bool = False
    MAX_SESSIONS: int = 100
    SESSION_TIMEOUT: int = 3600
    MAX_PAGES_PER_SESSION: int = 50

    class Config:
        env_file = ".env"


settings = Settings()
