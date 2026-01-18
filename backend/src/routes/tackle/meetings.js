/**
 * Meetings API Routes
 * Tackle.IO - Meeting Scheduler & Calendar Integration
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/v1/tackle/meetings - List meetings
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 50,
      contactId,
      dealId,
      status,
      startDate,
      endDate,
      sortBy = 'scheduledAt',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };

    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          deal: { select: { id: true, name: true, value: true } }
        }
      }),
      prisma.meeting.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        meetings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/tackle/meetings/book - Book a meeting
router.post('/book', async (req, res) => {
  try {
    const {
      contactId,
      dealId,
      title,
      description,
      scheduledAt,
      duration = 30, // minutes
      timezone,
      location,
      meetingUrl, // For video calls
      calendarId, // Google Calendar, Outlook, etc.
      sendInvite = true
    } = req.body;

    if (!scheduledAt || !title) {
      return res.status(400).json({
        success: false,
        error: 'Scheduled time and title are required'
      });
    }

    const scheduledDate = new Date(scheduledAt);
    const endDate = new Date(scheduledDate.getTime() + duration * 60000);

    // Create meeting record
    const meeting = await prisma.meeting.create({
      data: {
        userId: req.user.id,
        contactId,
        dealId,
        title,
        description,
        scheduledAt: scheduledDate,
        endAt: endDate,
        duration,
        timezone: timezone || 'UTC',
        location,
        meetingUrl,
        calendarId,
        status: 'scheduled',
        sendInvite
      },
      include: {
        contact: true,
        deal: true
      }
    });

    // In production, integrate with calendar APIs:
    // - Google Calendar API
    // - Microsoft Outlook API
    // - Calendly API
    // - Send calendar invites

    res.status(201).json({
      success: true,
      message: 'Meeting booked successfully',
      data: meeting
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/tackle/meetings/:id - Update meeting
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      scheduledAt,
      duration,
      location,
      meetingUrl,
      status,
      notes
    } = req.body;

    const existing = await prisma.meeting.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = new Date(scheduledAt);
      if (duration !== undefined) {
        updateData.endAt = new Date(new Date(scheduledAt).getTime() + duration * 60000);
      }
    }
    if (duration !== undefined) updateData.duration = duration;
    if (location !== undefined) updateData.location = location;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: meeting });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/tackle/meetings/:id - Cancel meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await prisma.meeting.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'cancelled' }
    });

    res.json({ success: true, message: 'Meeting cancelled' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
