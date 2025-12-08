from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str
    database_url: str
    ALGORITHM: str
    SECRET_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
