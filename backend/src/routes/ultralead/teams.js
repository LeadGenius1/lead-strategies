// Teams Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/teams
router.get('/', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: { some: { userId: req.user.id } }
      },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, name: true } } }
        }
      }
    });
    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user.id } }
      },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, name: true } } }
        }
      }
    });
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/teams
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'owner'
          }
        }
      },
      include: { members: true }
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/teams/:id/members
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    // Check if current user is owner/admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: req.params.id,
        userId: req.user.id,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ success: false, error: 'Only team owners/admins can add members' });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: req.params.id,
        userId,
        role
      },
      include: { user: { select: { id: true, email: true, name: true } } }
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/teams/:id/members/:memberId
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    // Check if current user is owner/admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: req.params.id,
        userId: req.user.id,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ success: false, error: 'Only team owners/admins can remove members' });
    }

    await prisma.teamMember.delete({ where: { id: req.params.memberId } });
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/teams/:id
router.delete('/:id', async (req, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });
    if (!team) return res.status(403).json({ success: false, error: 'Only team owner can delete the team' });

    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
