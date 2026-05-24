# R2 CORS Configuration

Your upload is failing due to CORS policy. You need to configure CORS on your Cloudflare R2 bucket.

## Steps to Fix:

### 1. Go to Cloudflare Dashboard
- Navigate to R2 Storage
- Select your bucket: `burner-video`
- Go to Settings tab

### 2. Add CORS Policy
Click "Add CORS policy" and use this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. For Production
When you deploy to production, add your production domain:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## Alternative: Using Wrangler CLI

If you prefer using the CLI:

```bash
# Install wrangler if not already installed
npm install -g wrangler

# Create cors.json file with the config above, then:
wrangler r2 bucket cors put burner-video --file cors.json
```

## What I Fixed in the Code:

1. ✅ Added `x-amz-meta-original-name` header to match the presigned URL signature
2. ✅ Ensured `Content-Type` header matches what the backend expects

After configuring CORS on R2, your uploads should work!
