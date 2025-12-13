from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str
    database_url: str
    ALGORITHM: str
    SECRET_KEY: str
    REFRESH_KEY: str

    R2_ACCOUNT_ID: str
    R2_ACCESS_KEY: str
    R2_SECRET_KEY: str
    R2_BUCKET_NAME: str = "burner-video"
    class Config:
        env_file = ".env"

settings = Settings()
