// VideoSite.AI Product Promotions
// CRUD for products + attach/detach products to videos

const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// ---- PUBLIC ROUTE (no auth) ----

// GET /api/v1/products/video/:videoId - Get products for a video (public)
router.get('/video/:videoId', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const videoProducts = await db.videoProduct.findMany({
      where: { videoId: req.params.videoId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            link: true,
            imageUrl: true,
            price: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    res.json({
      success: true,
      data: videoProducts.map((vp) => ({
        ...vp.product,
        position: vp.position,
      })),
    });
  } catch (error) {
    console.error('Get video products error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ---- AUTH REQUIRED ----
router.use(authenticate);

// GET /api/v1/products - List user's products
router.get('/', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const products = await db.product.findMany({
      where: { userId: req.user.id },
      include: {
        videos: {
          select: { videoId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: products.map((p) => ({
        ...p,
        videoCount: p.videos.length,
        videos: undefined,
      })),
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/products - Create product
router.post('/', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const { title, description, link, imageUrl, price } = req.body;

    if (!title || !link) {
      return res.status(400).json({ error: 'Title and link are required' });
    }

    const product = await db.product.create({
      data: {
        userId: req.user.id,
        title,
        description: description || null,
        link,
        imageUrl: imageUrl || null,
        price: price || null,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const product = await db.product.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        videos: {
          include: {
            video: { select: { id: true, title: true, status: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/v1/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const product = await db.product.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { title, description, link, imageUrl, price, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (link !== undefined) updateData.link = link;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (price !== undefined) updateData.price = price;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await db.product.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/v1/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const product = await db.product.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.product.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/products/video/:videoId/:productId - Attach product to video
router.post('/video/:videoId/:productId', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const { videoId, productId } = req.params;
    const { position } = req.body;

    // Verify user owns both the video and the product
    const [video, product] = await Promise.all([
      db.video.findFirst({ where: { id: videoId, userId: req.user.id } }),
      db.product.findFirst({ where: { id: productId, userId: req.user.id } }),
    ]);

    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Get next position if not provided
    let pos = position;
    if (pos === undefined) {
      const last = await db.videoProduct.findFirst({
        where: { videoId },
        orderBy: { position: 'desc' },
      });
      pos = (last?.position ?? -1) + 1;
    }

    const videoProduct = await db.videoProduct.upsert({
      where: { videoId_productId: { videoId, productId } },
      update: { position: pos },
      create: { videoId, productId, position: pos },
    });

    res.status(201).json({ success: true, data: videoProduct });
  } catch (error) {
    console.error('Attach product error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/v1/products/video/:videoId/:productId - Remove product from video
router.delete('/video/:videoId/:productId', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const { videoId, productId } = req.params;

    // Verify user owns the video
    const video = await db.video.findFirst({
      where: { id: videoId, userId: req.user.id },
    });

    if (!video) return res.status(404).json({ error: 'Video not found' });

    const existing = await db.videoProduct.findUnique({
      where: { videoId_productId: { videoId, productId } },
    });

    if (!existing) return res.status(404).json({ error: 'Product not attached to this video' });

    await db.videoProduct.delete({
      where: { videoId_productId: { videoId, productId } },
    });

    res.json({ success: true, message: 'Product removed from video' });
  } catch (error) {
    console.error('Remove product from video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
