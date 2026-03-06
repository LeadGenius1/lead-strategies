const express = require('express');
const { execSync } = require('child_process');
const renderRouter = require('./routes/render');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  let ffmpegOk = false;
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    ffmpegOk = true;
  } catch {
    // ffmpeg not available
  }
  res.json({ status: 'ok', ffmpeg: ffmpegOk });
});

// Render routes
app.use('/render', renderRouter);

app.listen(PORT, () => {
  console.log(`[FFmpeg Renderer] listening on port ${PORT}`);
});
