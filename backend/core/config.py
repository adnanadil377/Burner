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

    REDIS_URL: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-flash-latest"  # Default Gemini model
    PRESIGNED_URL_EXPIRATION: int = 3600  # 1 hour in seconds
    
    # Email address used as the sender for outbound application emails
    EMAIL_ADDRESS: str
    # Password or app-specific token for authenticating with the SMTP server
    EMAIL_PASSWORD: str
    # Hostname of the SMTP server used to send emails
    SMTP_SERVER: str
    # Port of the SMTP server (e.g. 587 for STARTTLS, 465 for SSL)
    SMTP_PORT: int

    # Base URL of the frontend application used when generating links in emails or redirects
    FRONTEND_URI: str
    # Set to True in production with HTTPS to enable secure cookie flag
    COOKIE_SECURE: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
