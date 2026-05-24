import httpx
import os

def upload_to_r2(upload_url: str, file_path: str, file_name: str = None):
    # 1. Handle missing filename (extract from path if None)
    if not file_name:
        file_name = os.path.basename(file_path)

    # 2. Get file size for Content-Length (Crucial for S3 PUT stability)
    try:
        file_size = os.path.getsize(file_path)
    except OSError:
        # Fallback if file doesn't exist or permissions issue
        file_size = 0

    headers = {
        "x-amz-meta-original-name": file_name,
        "Content-Type": "video/mp4",
        "Content-Length": str(file_size),
    }

    # 3. Use explicit timeouts. Set write/read to None to allow long uploads.
    timeout = httpx.Timeout(connect=10.0, read=None, write=None, pool=None)

    with httpx.Client(timeout=timeout) as client:
        with open(file_path, "rb") as f:
            resp = client.put(
                upload_url,
                headers=headers,
                content=f,  # streaming upload
            )
            
    resp.raise_for_status()
    
    return {"status": "success", "file": file_name}
