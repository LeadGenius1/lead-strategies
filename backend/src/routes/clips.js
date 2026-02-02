// Clips Routes (Video Clips Management)
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock data for development
const mockClips = [
  { id: '1', title: 'Product Intro Clip', duration: 30, category: 'intro', mood: 'professional', thumbnail: null, createdAt: new Date() },
  { id: '2', title: 'Customer Quote', duration: 15, category: 'testimonial', mood: 'inspiring', thumbnail: null, createdAt: new Date() },
  { id: '3', title: 'Call to Action', duration: 10, category: 'cta', mood: 'energetic', thumbnail: null, createdAt: new Date() },
];

router.use(authenticate);

// GET /api/v1/clips - List all clips
router.get('/', async (req, res) => {
  const { category, mood, search } = req.query;

  let filtered = [...mockClips];
  if (category) filtered = filtered.filter(c => c.category === category);
  if (mood) filtered = filtered.filter(c => c.mood === mood);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c => c.title.toLowerCase().includes(s));
  }

  res.json({
    success: true,
    data: { clips: filtered }
  });
});

// GET /api/v1/clips/:id
router.get('/:id', async (req, res) => {
  const clip = mockClips.find(c => c.id === req.params.id);
  if (!clip) return res.status(404).json({ success: false, error: 'Clip not found' });
  res.json({ success: true, data: clip });
});

// POST /api/v1/clips
router.post('/', async (req, res) => {
  const newClip = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
  res.status(201).json({ success: true, data: newClip });
});

// DELETE /api/v1/clips/:id
router.delete('/:id', async (req, res) => {
  res.json({ success: true, message: 'Clip deleted' });
});

module.exports = router;
