from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.video import Video
from models.user import User
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
import uuid
from core.config import settings

# from models.user import User
R2_ACCOUNT_ID = settings.R2_ACCOUNT_ID
R2_ACCESS_KEY = settings.R2_ACCESS_KEY
R2_SECRET_KEY = settings.R2_SECRET_KEY
# BUCKET_NAME = settings.getenv("R2_BUCKET_NAME", "burner-video")

s3 = boto3.client(
    service_name="s3",
    endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4")
)

def get_file_extension(filename: str) -> str:
    if "." in filename:
        return filename.rsplit(".", 1)[1]
    return ""

def presignedurl_get(user:User, fileName: str):
    try:
        get_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': 'burner-video', 
                'Key': fileName
            },
            ExpiresIn=3600  # Valid for 1 hour
        )
        return get_url
    except (ClientError, NoCredentialsError) as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not generate download link."
        )
    

def presignedurl_upload(user: User, file_name: str,db:Session, content_type: str = "video/mp4") -> dict:
    user_id = str(user.id) # Ensure ID is string
    
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
                'Bucket': 'burner-video',
                'Key': s3_key,
                'ContentType': content_type,
                # Metadata is optional, but useful
                'Metadata': {
                    'original-name': file_name
                }
            },
            ExpiresIn=3600
        )
        new_video=Video(user_id=user_id, s3_key=s3_key, bucket="burner-video", original_name=file_name, status="PENDING")
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
        "file_key": s3_key
    }

# response = s3.list_objects_v2(Bucket='burner-video')

# if 'Contents' in response:
#     print("Files in 'burner-video':")
#     for obj in response['Contents']:
#         print(f" - {obj['Key']} (Size: {obj['Size']} bytes)")
# else:
#     print("The bucket is empty.")