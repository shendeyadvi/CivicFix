import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { checkDuplicateCivicReport } from '../services/duplicateDetection';

const router = Router();

// Configure local disk storage for uploaded complaint photos
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `civic_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// GET /api/reports - Fetch all reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, department, ward, search } = req.query;

    const where: any = {};
    if (category && category !== 'All') {
      where.category = { contains: String(category) };
    }
    if (status && status !== 'All') {
      where.status = String(status);
    }
    if (department && department !== 'All') {
      where.department = { contains: String(department) };
    }
    if (ward && ward !== 'All') {
      where.ward = { contains: String(ward) };
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { trackingId: { contains: String(search) } },
        { location: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        timeline: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Format reports to match frontend interface
    const formatted = reports.map((r) => ({
      id: r.id,
      trackingId: r.trackingId,
      title: r.title,
      category: r.category,
      location: r.location,
      ward: r.ward,
      priority: r.priority,
      department: r.department,
      assignedTo: r.assignedTo,
      status: r.status,
      date: r.date,
      reportedAgo: r.reportedAgo,
      citizenName: r.citizenName,
      citizenPhone: r.citizenPhone,
      description: r.description,
      lat: r.lat,
      lng: r.lng,
      upvotes: r.upvotesCount,
      image: r.imageUrl || undefined,
      timeline: r.timeline.map((t) => ({
        step: t.step,
        date: t.date,
        completed: t.completed,
        current: t.current,
        note: t.note || undefined,
      })),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Fetch reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// GET /api/reports/stats - Aggregated metrics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const total = await prisma.report.count();
    const inProgress = await prisma.report.count({
      where: { status: 'In Progress' },
    });
    const resolved = await prisma.report.count({
      where: { status: { in: ['Resolved', 'Closed'] } },
    });
    const newReports = await prisma.report.count({
      where: { status: 'New' },
    });
    const pendingVerification = await prisma.report.count({
      where: { status: { in: ['Pending Verification', 'Verified'] } },
    });
    const overdue = await prisma.report.count({
      where: { status: 'Overdue' },
    });

    const resolutionRate = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%';

    return res.json({
      total,
      newToday: newReports,
      inProgress,
      resolved,
      overdue,
      pendingVerification,
      resolutionRate,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to compute stats.' });
  }
});

// GET /api/reports/track/:trackingId - Track by Ticket ID
router.get('/track/:trackingId', async (req: Request, res: Response) => {
  try {
    const trackingId = req.params.trackingId.trim().toUpperCase();

    const report = await prisma.report.findFirst({
      where: {
        OR: [
          { trackingId },
          { trackingId: `CF-${trackingId}` },
          { id: req.params.trackingId },
        ],
      },
      include: {
        timeline: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found with tracking ID: ' + trackingId });
    }

    return res.json({
      id: report.id,
      trackingId: report.trackingId,
      title: report.title,
      category: report.category,
      location: report.location,
      ward: report.ward,
      priority: report.priority,
      department: report.department,
      assignedTo: report.assignedTo,
      status: report.status,
      date: report.date,
      reportedAgo: report.reportedAgo,
      citizenName: report.citizenName,
      citizenPhone: report.citizenPhone,
      description: report.description,
      lat: report.lat,
      lng: report.lng,
      upvotes: report.upvotesCount,
      image: report.imageUrl || undefined,
      timeline: report.timeline.map((t) => ({
        step: t.step,
        date: t.date,
        completed: t.completed,
        current: t.current,
        note: t.note || undefined,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to track report.' });
  }
});

// POST /api/reports/check-duplicate - Proximity & category deduplication check
router.post('/check-duplicate', async (req: Request, res: Response) => {
  try {
    const { category, lat, lng, title } = req.body;
    if (!category || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'category, lat, and lng are required.' });
    }

    const result = await checkDuplicateCivicReport(category, Number(lat), Number(lng), title);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check duplicates.' });
  }
});

// POST /api/reports - Submit a new civic report
router.post('/', authenticateToken, upload.single('imageFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      category,
      location,
      ward,
      priority,
      department,
      description,
      citizenName,
      citizenPhone,
      lat,
      lng,
      image, // base64 or URL passed in JSON
    } = req.body;

    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (image && typeof image === 'string' && image.length > 0) {
      imageUrl = image;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CF-2026-${randomNum}`;

    let resolvedDept = department || 'Roads & Infrastructure';
    const cat = category || 'Roads & Potholes';
    if (!department) {
      if (cat.includes('Light')) resolvedDept = 'Electrical';
      else if (cat.includes('Waste') || cat.includes('Sanitation')) resolvedDept = 'Sanitation';
      else if (cat.includes('Water') || cat.includes('Drain')) resolvedDept = 'Water Department';
      else if (cat.includes('Safety') || cat.includes('Infra')) resolvedDept = 'Public Works';
    }

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const parsedLat = lat ? parseFloat(lat) : 18.5204 + (Math.random() * 0.04 - 0.02);
    const parsedLng = lng ? parseFloat(lng) : 73.8567 + (Math.random() * 0.04 - 0.02);

    const report = await prisma.report.create({
      data: {
        trackingId,
        title: title || 'Civic Complaint',
        category: cat,
        location: location || 'FC Road, Shivajinagar, Pune',
        ward: ward || 'Ward 12 - Shivajinagar',
        priority: priority || 'Medium',
        department: resolvedDept,
        assignedTo: 'PMC Nodal Officer',
        status: 'New',
        date: formattedDate,
        reportedAgo: 'Just now',
        citizenName: citizenName || req.user?.name || 'Aarav Deshmukh',
        citizenPhone: citizenPhone || '+91 98765 43210',
        description: description || 'Citizen reported issue via CivicFix app.',
        lat: parsedLat,
        lng: parsedLng,
        imageUrl,
        userId: req.user?.userId || null,
        timeline: {
          create: [
            { step: 'Report Submitted', date: formattedDate, completed: true, order: 1 },
            { step: 'AI Issue Verification', date: 'Pending', completed: false, current: true, order: 2 },
            { step: 'Team Assignment', date: 'Pending', completed: false, order: 3 },
            { step: 'Issue Resolved', date: 'Pending', completed: false, order: 4 },
          ],
        },
      },
      include: {
        timeline: true,
      },
    });

    return res.status(201).json({
      message: 'Report created successfully',
      report: {
        id: report.id,
        trackingId: report.trackingId,
        title: report.title,
        category: report.category,
        location: report.location,
        ward: report.ward,
        priority: report.priority,
        department: report.department,
        assignedTo: report.assignedTo,
        status: report.status,
        date: report.date,
        reportedAgo: report.reportedAgo,
        citizenName: report.citizenName,
        citizenPhone: report.citizenPhone,
        description: report.description,
        lat: report.lat,
        lng: report.lng,
        upvotes: report.upvotesCount,
        image: report.imageUrl || undefined,
        timeline: report.timeline,
      },
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// PATCH /api/reports/:id/status - Update report status (Official or Admin)
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { trackingId: id }],
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { status },
      include: { timeline: true },
    });

    // If resolved, update timeline event
    if (status === 'Resolved' || status === 'Closed') {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Resolved' } },
        data: { completed: true, current: false, date: 'Today' },
      });
    }

    return res.json({ message: 'Status updated successfully', report: updated });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

// PATCH /api/reports/:id/department - Reassign department
router.patch('/:id/department', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department } = req.body;
    const { id } = req.params;

    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { department, status: 'Assigned' },
    });

    return res.json({ message: 'Department assigned successfully', report: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign department.' });
  }
});

// POST /api/reports/:id/upvote - Upvote report
router.post('/:id/upvote', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || null;

    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Check if already upvoted
    if (userId) {
      const existing = await prisma.upvote.findUnique({
        where: { reportId_userId: { reportId: report.id, userId } },
      });

      if (existing) {
        // Toggle remove upvote
        await prisma.upvote.delete({ where: { id: existing.id } });
        const updated = await prisma.report.update({
          where: { id: report.id },
          data: { upvotesCount: { decrement: 1 } },
        });
        return res.json({ upvoted: false, upvotes: updated.upvotesCount });
      } else {
        await prisma.upvote.create({
          data: { reportId: report.id, userId, ipAddress },
        });
        const updated = await prisma.report.update({
          where: { id: report.id },
          data: { upvotesCount: { increment: 1 } },
        });
        return res.json({ upvoted: true, upvotes: updated.upvotesCount });
      }
    } else {
      // Anonymous upvote
      const updated = await prisma.report.update({
        where: { id: report.id },
        data: { upvotesCount: { increment: 1 } },
      });
      return res.json({ upvoted: true, upvotes: updated.upvotesCount });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to upvote report.' });
  }
});

// DELETE /api/reports/:id - Delete report
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    await prisma.report.delete({ where: { id: report.id } });
    return res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete report.' });
  }
});

export default router;
