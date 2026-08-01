# 🎬 Burner — Interview Preparation Guide

> **Project**: Burner — AI-powered burnt subtitle customization for short-form video content  
> **Stack**: React 19 + TypeScript (Frontend) · FastAPI + Python (Backend) · PostgreSQL · Redis · Celery · Cloudflare R2 · Google Gemini AI

---

## 📌 Project Overview (30-second pitch)

> "Burner is a full-stack SaaS application that lets content creators add AI-generated, visually-aware burnt-in subtitles to their short-form videos. Users upload a video, the system transcribes it using Google Gemini's multimodal AI — which also analyzes the video frames to intelligently position and style subtitles — and then renders the final video with captions baked directly into the frames using a custom Skia-based renderer."

---

## 🏛️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│              React 19 + TypeScript + Vite + Zustand          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Application Server                   │
│           (Uvicorn · CORS Middleware · SlowAPI rate limiter)  │
│                                                              │
│  /auth/*      → JWT Auth (register, login, refresh, email)   │
│  /video/*     → Video upload, transcription, burn pipeline   │
└──────────┬────────────────┬────────────────┬────────────────┘
           │                │                │
           ▼                ▼                ▼
    ┌──────────┐    ┌──────────────┐  ┌────────────────┐
    │PostgreSQL│    │ Cloudflare R2│  │  Redis Broker  │
    │(SQLAlch) │    │ (S3-compat.) │  │  (Celery Queue)│
    └──────────┘    └──────────────┘  └───────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   Celery Workers     │
                                    │  ┌─────────────────┐ │
                                    │  │ extract_audio_  │ │
                                    │  │ and_transcribe  │ │
                                    │  │  (Gemini AI)    │ │
                                    │  ├─────────────────┤ │
                                    │  │burn_animated_   │ │
                                    │  │   caption       │ │
                                    │  │(Skia renderer)  │ │
                                    │  └─────────────────┘ │
                                    └─────────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │  Cloudflare R2       │
                                    │  (Processed Videos)  │
                                    └─────────────────────┘
```

### Architecture Pattern
- **Async Task Queue pattern** (Producer-Consumer): The FastAPI server acts as the **producer**, enqueuing CPU-intensive jobs (transcription, rendering) to Celery workers via Redis. This keeps the HTTP layer non-blocking.
- **Presigned URL pattern**: Videos are uploaded **directly from the client to Cloudflare R2** — the server only issues a short-lived signed URL. This offloads bandwidth from the API server entirely.
- **Layered backend structure**: `api → controller → models/schemas` — clean separation of routing, business logic, and data.

---

## 🛠️ Tech Stack Choices

### Frontend

| Technology | Why We Chose It |
|---|---|
| **React 19** | Industry standard for SPAs; latest concurrent features, improved hydration |
| **TypeScript** | Type safety across the whole frontend — catches API contract mismatches early |
| **Vite** | Near-instant HMR, ES module-based dev server — much faster than CRA/Webpack |
| **Zustand** | Lightweight global state with minimal boilerplate vs. Redux; co-locates state with actions |
| **Tailwind CSS** | Utility-first for rapid, consistent UI development without context-switching |

### Backend

| Technology | Why We Chose It |
|---|---|
| **FastAPI** | Async-first, auto-generates OpenAPI docs, Pydantic validation built-in, fastest Python web framework |
| **Uvicorn** | ASGI server — required for FastAPI's async capabilities |
| **SQLAlchemy 2.0** | Mature ORM with Python-native query syntax; easy migrations; supports PostgreSQL |
| **Pydantic v2** | Runtime data validation and serialization; powers FastAPI's request/response models |
| **PostgreSQL** | Relational DB with UUID primary keys, JSON column support (for storing subtitle arrays), and ACID compliance |
| **Redis** | High-throughput in-memory store used as Celery's message broker AND result backend |
| **Celery** | Battle-tested distributed task queue; handles retries, task routing, and result tracking |
| **Google Gemini AI** (gemini-flash-latest) | Multimodal model — processes both audio AND video frames simultaneously, enabling context-aware subtitle placement |
| **Skia-Python** | Google's 2D graphics engine — used for frame-accurate, GPU-accelerated subtitle rendering with custom fonts, animations (glow, shake, pop), and per-frame positioning |
| **Cloudflare R2** | S3-compatible object storage with **no egress fees** — critical cost saving vs. AWS S3 for a video-heavy app |
| **boto3** | AWS SDK — used to interface with R2's S3-compatible API |
| **python-jose + passlib** | JWT token generation/validation and bcrypt password hashing for auth |
| **SlowAPI** | Rate limiting middleware for FastAPI — prevents abuse of expensive AI endpoints |
| **FFmpeg** | Industry-standard video processing tool used for encoding the final burnt video |

---

## 🔄 Core Video Pipeline (Step-by-Step)

```
1. Client requests presigned upload URL  →  POST /video/upload
2. Client uploads directly to R2         →  PUT <presigned_url>  (bypasses server)
3. Client confirms upload complete       →  POST /video/upload-success
4. Client requests transcription         →  POST /video/transcribe
5. FastAPI enqueues Celery task          →  celery_app.delay(extract_audio_and_transcribe)
6. Celery worker:
   a. Downloads video from R2 presigned URL
   b. Uploads video to Gemini Files API
   c. Waits for Gemini PROCESSING state → ACTIVE
   d. Prompts Gemini with structured JSON schema (SubtitlesResponse)
   e. Gemini returns timestamped subtitles with position (x, y), color, and animation style
   f. Saves subtitles to PostgreSQL Transcription table
   g. Cleans up local temp file
7. Client polls / fetches transcription  →  GET /video/transcription/{video_id}
8. User edits subtitles in UI            →  PUT /video/transcription/{video_id}
9. Client requests burn                  →  POST /video/burn/{video_id}
10. FastAPI enqueues Celery task         →  burn_animated_caption.delay(...)
11. Celery worker:
    a. Downloads original video
    b. Runs VideoTextRenderer (Skia) — draws subtitles frame-by-frame with animations
    c. Uploads rendered video to R2 via presigned PUT URL
12. Client fetches download URL          →  GET /video/download
```

---

## 📊 Database Schema

```
users
├── id (UUID, PK)
├── email (unique)
├── hashed_password
└── ...

videos
├── id (Integer, PK)
├── user_id (UUID, FK → users.id)
├── s3_key (unique)           ← R2 object key
├── bucket (String)
├── original_name (String)
└── status (String)           ← PENDING, UPLOADED, PROCESSING, DONE

transcriptions
├── id (Integer, PK)
├── video_id (FK → videos.id)
├── subtitles (JSON)          ← Array of {id, start, end, text, style, x, y}
└── status (String)           ← PENDING, COMPLETED, FAILED
```

---

## 🔐 Authentication Flow

```
Register → email/password → bcrypt hash → saved to DB → verification email sent (SMTP)
Login    → verify password → issue JWT access token + refresh token (HttpOnly cookie)
Request  → Bearer token in Authorization header → FastAPI dependency validates JWT
Refresh  → send refresh token → issue new access token
```

- Uses **short-lived access tokens** + **long-lived refresh tokens** stored in HttpOnly cookies (XSS protection)
- `get_current_user` is a FastAPI `Depends()` — injected into every protected route

---

## 📈 How Would You Scale This?

### Current Bottlenecks
1. **Celery workers** are CPU/memory-bound (Skia rendering, FFmpeg)
2. **Single Redis instance** — no HA
3. **Single PostgreSQL instance**
4. **Gemini API rate limits** under high concurrency

### Scaling Strategy

#### Horizontal Scaling (Scale Out)
- **Celery workers**: Spin up more worker containers (Docker/Kubernetes). Workers are stateless — just need Redis access. Use **Celery task routing** to separate transcription queues from rendering queues (different resource profiles).
- **FastAPI**: Stateless — run multiple instances behind a **load balancer** (Nginx / AWS ALB). No session state (JWT is stateless).

#### Database Scaling
- **Read replicas** for PostgreSQL (AWS RDS / Supabase) to offload read-heavy queries (fetching user videos, transcriptions)
- **Connection pooling** via PgBouncer or SQLAlchemy pool settings
- For massive scale: migrate subtitle JSON to a dedicated **NoSQL store** (DynamoDB / MongoDB) where the schema is more flexible

#### Storage Scaling
- **Cloudflare R2 already scales infinitely** — no changes needed
- Implement **lifecycle policies**: auto-delete processed temp files after 24h

#### Queue & Caching
- **Redis Cluster** for HA broker — or migrate to **Amazon SQS** for managed reliability
- **Result caching**: Cache transcription results in Redis with a TTL to avoid duplicate Gemini API calls for unchanged videos

#### AI / Gemini Rate Limits
- Implement a **token bucket / rate limiter** per user at the API layer (SlowAPI already partially does this)
- Queue requests to Gemini using **task prioritization** (premium users get higher-priority queue)
- **Batch processing**: Group concurrent transcription requests where possible

#### CDN & Edge
- Serve processed videos through **Cloudflare CDN** (R2 integrates natively) — reduces latency globally
- Pre-generate presigned URLs with longer TTLs for frequently accessed content

#### Observability at Scale
- Add **Celery Flower** for task monitoring dashboard
- Integrate **Sentry** for error tracking in workers
- Use **Prometheus + Grafana** for queue depth, task duration, and API latency metrics

---

## 🔑 Key Technologies Deep Dive

### Google Gemini (Multimodal AI)
- **Why Gemini over Whisper?** Whisper is audio-only. Gemini processes both audio AND video frames — enabling it to avoid covering faces and important objects with subtitles.
- **Structured output**: We pass a Pydantic JSON schema to `response_json_schema`, forcing Gemini to return parseable, typed subtitle objects.
- **Model**: `gemini-flash-latest` — fastest Gemini model; optimal for latency-sensitive video processing.

### Skia-Python (Rendering Engine)
- **What is Skia?** Google's open-source 2D graphics library — powers Chrome, Android, and Flutter.
- **Why not FFmpeg subtitles?** FFmpeg's `subtitles=` filter only supports basic ASS/SRT styling. Skia allows frame-accurate custom animations: glow, shake, pop, karaoke effects with per-frame control.
- **How it works**: `VideoTextRenderer` reads the video frame-by-frame, draws subtitle text with Skia, and writes back an MP4.

### Celery + Redis
- **Task Serializer**: JSON (not pickle) — safer for distributed environments, no arbitrary code execution.
- **`task_track_started=True`**: Allows the API to know when a task actually started (vs. just queued).
- **Retry logic**: Celery supports automatic retries with exponential backoff for transient failures (Gemini API timeouts, R2 upload failures).

### Cloudflare R2
- **Zero egress fees** — critical for a video platform where users download processed files repeatedly.
- **S3-compatible API** — boto3 works with a custom endpoint, no vendor lock-in at the code level.
- **CORS setup**: Configured to allow direct client-to-R2 uploads via presigned URLs.

---

## ❓ Likely Interview Questions & Answers

**Q: Why did you use Celery instead of FastAPI's `BackgroundTasks`?**
> FastAPI's `BackgroundTasks` run in-process — they'd block or be killed if the server restarts and can't distribute work across machines. Celery tasks are truly distributed, persistent (survive restarts), retriable, and observable. For CPU-intensive work like Skia rendering and AI inference, a separate worker process is essential.

**Q: How do you handle failures in the transcription pipeline?**
> The Celery task wraps all logic in a try/except. On failure, it updates the `Transcription.status` to `"FAILED"` in PostgreSQL before re-raising. The API exposes a `POST /transcription/{video_id}/regenerate` endpoint that lets users retry. Celery also supports automatic retries with configurable backoff.

**Q: Why Cloudflare R2 over AWS S3?**
> R2 offers zero egress fees. For a video platform where processed files may be downloaded multiple times, S3 egress costs would be prohibitive. R2's S3-compatible API means we use the same boto3 code — just a different endpoint URL.

**Q: How do you prevent a user from accessing another user's video?**
> Every protected endpoint uses the `get_current_user` FastAPI dependency to extract the authenticated user from the JWT. All database queries filter by `Video.user_id == user.id` — a user can never query, transcribe, or burn a video that doesn't belong to them.

**Q: What is the most expensive operation and how would you optimize it?**
> Skia rendering is the most expensive — it is O(frames x subtitles). Optimization paths: (1) Use GPU-accelerated Skia backends, (2) Render only changed frames (delta rendering), (3) Use FFmpeg hardware encoding (h264_nvenc) for the output step, (4) Scale Celery workers horizontally with GPU-attached instances.

**Q: How does the structured output from Gemini work?**
> We pass a Pydantic model's `.model_json_schema()` to the Gemini API as `response_json_schema`. Gemini enforces this schema on its output, giving us strongly-typed, parseable JSON — no fragile regex parsing of free-form text.

**Q: How would you add real-time progress updates for users?**
> Implement Server-Sent Events (SSE) or WebSockets in FastAPI. Celery workers would push status updates to a Redis pub/sub channel keyed by `task_id`. The SSE endpoint would subscribe and stream updates to the client. Alternatively, poll `GET /video/transcription/{id}` with exponential backoff from the frontend.

**Q: Walk me through your auth flow.**
> Registration hashes the password with bcrypt via passlib, stores the user, and sends a verification email via SMTP/Jinja2 template. Login verifies the hash, generates a short-lived JWT access token and a long-lived refresh token. The refresh token is stored in an HttpOnly cookie (XSS-safe). Every request passes the Bearer token to `get_current_user`, which decodes it with python-jose. Expired tokens return 401, prompting the client to hit `/auth/refresh`.

---

## 📂 Project Structure Reference

```
Burner/
├── backend/
│   ├── api/
│   │   ├── auth.py              # Register, login, refresh, email verify
│   │   └── video_upload.py      # Upload, transcribe, burn, download endpoints
│   ├── controller/
│   │   └── video_upload_controller.py  # Business logic layer
│   ├── core/
│   │   ├── celery_app.py        # Celery + Redis configuration
│   │   └── config.py            # Pydantic Settings (env vars)
│   ├── db/
│   │   ├── base.py              # SQLAlchemy Base
│   │   └── session.py           # Engine + SessionLocal
│   ├── models/
│   │   ├── user.py              # User ORM model (UUID PK)
│   │   ├── video.py             # Video ORM model
│   │   └── transcription.py     # Transcription ORM model (JSON subtitles)
│   ├── schemas/
│   │   ├── video.py             # Pydantic request/response schemas
│   │   ├── transcription.py     # SubtitleResponse, SubtitlesResponse
│   │   └── burn.py              # Style schema for burn endpoint
│   ├── tasks/
│   │   └── video_tasks.py       # Celery tasks: transcribe, burn_animated_caption
│   ├── utils/
│   │   ├── s3_initial.py        # R2 presigned URL generation
│   │   ├── upload_r2.py         # Upload helper to R2
│   │   └── skia_rendering.py    # VideoTextRenderer (Skia-based frame renderer)
│   ├── dependency.py            # get_current_user FastAPI dependency
│   └── main.py                  # FastAPI app + router registration + CORS
└── frontend/
    └── src/                     # React 19 + TypeScript components
```

---

## 🚀 Quick Wins to Mention

- **No server bandwidth for uploads**: Direct client → R2 presigned upload pattern
- **AI that understands video context**: Gemini places subtitles to avoid faces/objects
- **Custom animation effects**: Skia enables glow, shake, pop effects — not possible with standard FFmpeg subtitle filters
- **Rate limiting**: SlowAPI protects expensive AI endpoints from abuse
- **Secure auth**: HttpOnly cookies for refresh tokens, bcrypt for password storage, JWT for stateless auth

---

*Good luck today! 🎯*
