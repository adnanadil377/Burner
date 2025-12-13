from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.video import Video
from models.user import User
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
import uuid
from core.config import settings

R2_ACCOUNT_ID = settings.R2_ACCOUNT_ID
R2_ACCESS_KEY = settings.R2_ACCESS_KEY
R2_SECRET_KEY = settings.R2_SECRET_KEY
R2_BUCKET_NAME = settings.R2_BUCKET_NAME

def get_s3_client():
    return boto3.client(
        service_name="s3",
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4")
    )

s3 = get_s3_client()

def get_file_extension(filename: str) -> str:
    if "." in filename:
        return filename.rsplit(".", 1)[1]
    return ""

def create_presigned_download_url(user: User, fileName: str) -> dict:
    try:
        get_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': R2_BUCKET_NAME, 
                'Key': fileName
            },
            ExpiresIn=3600  # Valid for 1 hour
        )
        return {"download_url": get_url}
    except (ClientError, NoCredentialsError) as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not generate download link."
        )

def initiate_video_upload(user: User, file_name: str, db: Session, content_type: str = "video/mp4") -> dict:
    user_id = str(user.id) # Ensure ID is string
    print(file_name)
    # Safer extension handling
    ext = get_file_extension(file_name)
    if not ext:
        raise HTTPException(status_code=400, detail="File must have an extension")
        
    unique_filename = f"{uuid.uuid4()}.{ext}"
    s3_key = f"{user_id}/{unique_filename}"

    try:
        put_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': R2_BUCKET_NAME,
                'Key': s3_key,
                'ContentType': content_type,
                'Metadata': {
                    'original-name': file_name
                }
            },
            ExpiresIn=3600
        )
        
        # Create DB record with PENDING status
        new_video = Video(
            user_id=user.id, # Now using integer ID for DB as per model
            s3_key=s3_key, 
            bucket=R2_BUCKET_NAME, 
            original_name=file_name, 
            status="PENDING"
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)

    except ClientError as e:
        print(f"Failed to generate UPLOAD URL for {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not generate upload link."
        )
        
    return {
        "upload_url": put_url, 
        "file_key": s3_key,
        "video_id": new_video.id
    }

def confirm_upload(db: Session, video_id: int, user: User) -> dict:
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.status == "COMPLETED":
        return {"message": "Video already marked as completed", "video": video}

    # Verify file exists in R2
    try:
        s3.head_object(Bucket=R2_BUCKET_NAME, Key=video.s3_key)
    except ClientError:
        raise HTTPException(status_code=400, detail="File verification failed. Video not found in storage.")

    video.status = "COMPLETED"
    db.commit()
    db.refresh(video)
    return {"message": "Upload verified and completed", "video": video}