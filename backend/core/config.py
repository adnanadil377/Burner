from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str
    database_url: str
    ALGORITHM: str
    SECRET_KEY: str
    REFRESH_KEY: str
<<<<<<< HEAD

=======
>>>>>>> 59a9a8a70eac0f2606ac2307f8cc2283866de33f
    class Config:
        env_file = ".env"

settings = Settings()
