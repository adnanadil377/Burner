# 🔥 Two-Step File Upload System

A clean, production-ready file upload system using the **Two-Step Upload Pattern** with Cloudflare R2.

## 🎯 How It Works

### The Two-Step Process

Instead of uploading files through your server (which is slow and expensive), we use presigned URLs:

```
┌─────────┐    1. Request     ┌──────────┐    2. Presigned URL    ┌─────────────┐
│ Browser │ ───────────────> │ Your API │ ───────────────────> │ Cloudflare  │
│         │                   │          │                       │     R2      │
│         │ <─────────────── │          │ <─────────────────── │             │
└─────────┘    Upload URL     └──────────┘                       └─────────────┘
     │                                                                   ▲
     │                                                                   │
     └───────────────────────────────────────────────────────────────────┘
                    3. Direct Upload (bypasses your server!)
```

**Step 1: Request Permission**
- Browser asks your API: "Can I upload video.mp4?"
- API validates the request
- API generates a presigned URL (valid for 1 hour)
- API returns: `{ uploadUrl, fileId, publicUrl }`

**Step 2: Direct Upload**
- Browser uploads directly to Cloudflare R2 using the presigned URL
- Your server is NOT involved in the actual file transfer
- Progress tracking happens client-side

### Why This Is Better

✅ **Faster**: Direct upload to R2, no server bottleneck  
✅ **Cheaper**: No bandwidth costs on your server  
✅ **Scalable**: R2 handles the heavy lifting  
✅ **Secure**: Presigned URLs expire automatically  
✅ **Better UX**: Real-time progress tracking

---

## 🚀 Setup Instructions

### 1. Frontend (Already Done!)

The upload component is located at:
```
frontend/src/components/Dashboard/FileUpload.tsx
```

It's already integrated into the Dashboard page.

### 2. Backend Setup

#### Install Required Packages

```bash
cd backend
pip install boto3 botocore
```

#### Configure Environment Variables

Add these to your `backend/.env` file:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=your_bucket_name
```

### 3. Cloudflare R2 Setup

#### Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → **Create bucket**
3. Choose a bucket name (e.g., `burner-uploads`)
4. Note your **Account ID** (visible in the URL)

#### Generate API Keys

1. In R2 dashboard, go to **Manage R2 API Tokens**
2. Click **Create API Token**
3. Select **Object Read & Write** permissions
4. Copy the:
   - Access Key ID
   - Secret Access Key
   - Account ID

#### Configure Public Access (Optional)

If you want files to be publicly accessible:

1. Go to your bucket settings
2. Enable **Public Access**
3. Your files will be available at:
   ```
   https://pub-{account_id}.r2.dev/{object_key}
   ```

Or set up a custom domain for cleaner URLs:
```
https://cdn.yourdomain.com/{object_key}
```

---

## 📝 API Endpoints

### POST `/api/upload/request`

Request a presigned URL for upload.

**Request:**
```json
{
  "fileName": "video.mp4",
  "fileType": "video/mp4"
}
```

**Response:**
```json
{
  "uploadUrl": "https://account.r2.cloudflarestorage.com/bucket/...",
  "fileId": "uuid-here",
  "publicUrl": "https://pub-account.r2.dev/uploads/uuid.mp4"
}
```

### POST `/api/upload/confirm/{file_id}`

Confirm successful upload (optional).

### GET `/api/upload/files`

List all uploaded files for current user.

---

## 🎨 Component Features

- ✅ Drag & drop support
- ✅ File picker (click to browse)
- ✅ Real-time progress tracking
- ✅ Two-step process visualization
- ✅ Success/error states
- ✅ File size formatting
- ✅ Accessible & responsive design
- ✅ Follows Burner design system (Outfit font, flame colors, etc.)

---

## 🔐 Security Considerations

### Current Implementation

- Presigned URLs expire after 1 hour
- TODO: Add user authentication to `/api/upload/request`
- TODO: Validate file types and sizes server-side
- TODO: Rate limiting on upload requests

### Production Checklist

```python
# api/upload.py

@router.post("/request")
async def request_upload_url(
    request: UploadRequest,
    current_user: User = Depends(get_current_user)  # ← Add this!
):
    # Validate file type
    allowed_types = ['video/', 'image/', 'application/pdf']
    if not any(request.fileType.startswith(t) for t in allowed_types):
        raise HTTPException(400, "File type not allowed")
    
    # Check user quota
    if await user_has_exceeded_quota(current_user.id):
        raise HTTPException(403, "Upload quota exceeded")
    
    # ... rest of implementation
```

---

## 📊 Database Schema (Optional)

Track uploads in your database:

```python
class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    object_key = Column(String)  # R2 object key
    public_url = Column(String)
    status = Column(String)  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="uploads")
```

---

## 🎭 Styling Notes

The component uses your design system variables:

```css
--flame-orange: #FF5E00
--flame-red: #FF3C78
--flame-pink: #FF6B9D
--bg-primary: #0A0A0C
--bg-secondary: #14141A
--success-green: #00E676
```

Font: **Outfit** (loaded in your index.css)

---

## 🐛 Troubleshooting

### CORS Issues

Make sure your R2 bucket has CORS configured:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Upload Fails Silently

Check browser console for errors. Common issues:
- Invalid presigned URL (check R2 credentials)
- CORS not configured on R2
- Presigned URL expired (default: 1 hour)

### File Not Accessible After Upload

- Check R2 bucket public access settings
- Verify the `publicUrl` format in `api/upload.py`
- Consider using a custom domain

---

## 🚀 Next Steps

1. **Add Authentication**
   - Protect `/api/upload/request` endpoint
   - Validate user permissions

2. **Implement Database Tracking**
   - Save upload records
   - Track upload status
   - Associate uploads with users

3. **Add Post-Processing**
   - Generate thumbnails for videos
   - Transcode videos to different formats
   - Scan for viruses/malware

4. **Enhance UX**
   - Multiple file uploads
   - Upload queue management
   - Resume interrupted uploads

5. **Production Hardening**
   - Rate limiting
   - File type validation
   - Size limits enforcement
   - Quota management

---

## 📚 Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Presigned URLs Explained](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

---

Built with 🔥 by the Burner team
