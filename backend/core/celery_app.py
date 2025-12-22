from celery import Celery
from .config import settings

REDIS_URL=settings.REDIS_URL
celery_app = Celery(
    "burner_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)
# Optional: Configure Celery to look for tasks in a specific module
celery_app.conf.imports = ["tasks.video_tasks"]

# Optional: Professional settings for reliability
celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)