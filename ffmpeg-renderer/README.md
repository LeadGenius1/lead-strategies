# FFmpeg Renderer Microservice

Video rendering service for the AI Lead Strategies video creation pipeline. Receives render jobs from the main backend, composites video clips with voiceover and music via FFmpeg, uploads to Cloudflare R2.

## API

- `GET /health` - Health check (returns `{ status: 'ok', ffmpeg: true }`)
- `POST /render` - Submit render job (returns `{ job_id }`)
- `GET /render/:id` - Poll job status (returns `{ status, progress, output_url, error }`)

## Railway Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Set automatically by Railway |
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Yes | Cloudflare R2 secret key |
| `R2_ENDPOINT` | Yes | `https://91d1bdf46216e74b24964ea0139e09de.r2.cloudflarestorage.com` |
| `R2_BUCKET_NAME` | No | Default: `videosite` |
| `R2_PUBLIC_URL` | No | Default: `https://pub-08746658f70a4185a980f297b96d9e3b.r2.dev` |
| `MAX_CONCURRENT_RENDERS` | No | Default: `2` |

## Backend Configuration

Set on the **main backend** Railway service:
```
FFMPEG_RENDERER_URL=https://ffmpeg-renderer-production.up.railway.app
```

## Deploy to Railway

1. Create a new Railway service from this directory
2. Set the environment variables listed above
3. Railway will auto-build from the Dockerfile
4. Set the public domain to `ffmpeg-renderer-production.up.railway.app`
5. Set `FFMPEG_RENDERER_URL` on the main backend service
