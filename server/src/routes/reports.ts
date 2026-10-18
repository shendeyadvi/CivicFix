import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { checkDuplicateCivicReport } from '../services/duplicateDetection';

const router = Router();

// Configure storage for uploaded complaint photos
import os from 'os';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.join(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
  // Ignore in serverless environments where local disk may be restricted
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch {
      // Ignore
    }
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

// Format report to match frontend interface
function formatReport(r: any) {
  return {
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
    timeline: (r.timeline || []).map((t: any) => ({
      step: t.step,
      date: t.date,
      completed: t.completed,
      current: t.current,
      note: t.note || undefined,
    })),
  };
}

// GET /api/reports/my - Fetch reports owned by the currently authenticated citizen (requires auth)
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to view your reports.' });
  }

  try {
    const userId = req.user.userId;

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        timeline: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.json(reports.map(formatReport));
  } catch (error) {
    console.error('Fetch my reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch your reports.' });
  }
});

// GET /api/reports - Fetch all reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, department, ward, search } = req.query;

    const where: any = {};
    if (category && category !== 'All') {
      where.category = { contains: String(category), mode: 'insensitive' };
    }
    if (status && status !== 'All') {
      where.status = String(status);
    }
    if (department && department !== 'All') {
      where.department = { contains: String(department), mode: 'insensitive' };
    }
    if (ward && ward !== 'All') {
      where.ward = { contains: String(ward), mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { trackingId: { contains: String(search), mode: 'insensitive' } },
        { location: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
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

    const formatted = reports.map(formatReport);
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

    return res.json(formatReport(report));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to track report.' });
  }
});

// POST /api/reports/check-duplicate - Proximity, defect keyword & AI deduplication check
router.post('/check-duplicate', async (req: Request, res: Response) => {
  try {
    const { category, lat, lng, title, description, imageUrl, radiusMeters } = req.body;
    if (!category || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'category, lat, and lng are required.' });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'lat and lng must be valid numbers.' });
    }

    const result = await checkDuplicateCivicReport({
      category: String(category),
      lat: parsedLat,
      lng: parsedLng,
      title: title ? String(title) : undefined,
      description: description ? String(description) : undefined,
      imageUrl: imageUrl ? String(imageUrl) : undefined,
      radiusMeters: radiusMeters !== undefined ? parseFloat(radiusMeters) : undefined,
    });

    return res.json(result);
  } catch (error) {
    console.error('Check duplicate error:', error);
    return res.status(500).json({ error: 'Failed to check duplicates.' });
  }
});

// POST /api/reports - Submit a new civic report (with server-side duplicate prevention)
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
      forceNew, // when true, user confirmed separate submission despite duplicate detection
    } = req.body;

    const shouldForceNew = forceNew === true || forceNew === 'true' || forceNew === 1 || forceNew === '1';

    let imageUrl: string | null = null;
    let imageBuffer: Buffer | undefined = undefined;
    let imageMimeType: string | undefined = undefined;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      try {
        if (req.file.path && fs.existsSync(req.file.path)) {
          imageBuffer = fs.readFileSync(req.file.path);
          imageMimeType = req.file.mimetype;
        }
      } catch (fErr) {
        console.warn('Could not read uploaded file buffer for duplicate comparison:', fErr);
      }
    } else if (image && typeof image === 'string' && image.length > 0) {
      imageUrl = image;
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          imageMimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
        }
      }
    }

    const cat = category || 'Roads & Potholes';
    const parsedLat = lat !== undefined && lat !== '' ? parseFloat(lat) : 18.5204 + (Math.random() * 0.04 - 0.02);
    const parsedLng = lng !== undefined && lng !== '' ? parseFloat(lng) : 73.8567 + (Math.random() * 0.04 - 0.02);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Invalid geographic coordinates provided.' });
    }

    // Server-side duplicate verification before creating a new report
    // If a potential duplicate exists and user has NOT explicitly forced separate submission,
    // return the existing complaint rather than creating another independent complaint.
    if (!shouldForceNew) {
      const duplicateResult = await checkDuplicateCivicReport({
        category: cat,
        lat: parsedLat,
        lng: parsedLng,
        title: title || '',
        description: description || '',
        imageBuffer,
        imageMimeType,
        imageUrl: imageUrl || undefined,
      });

      if (duplicateResult.isDuplicate && duplicateResult.existingReport) {
        return res.status(200).json({
          potentialDuplicate: true,
          message: 'A potential duplicate civic report was identified at this location.',
          confidence: duplicateResult.confidence,
          isCertainMatch: duplicateResult.isCertainMatch,
          matchReason: duplicateResult.matchReason,
          existingReport: duplicateResult.existingReport,
        });
      }
    }

    let randomNum = Math.floor(1000 + Math.random() * 9000);
    let trackingId = `CF-2026-${randomNum}`;
    let existingReport = await prisma.report.findUnique({ where: { trackingId } });
    while (existingReport) {
      randomNum = Math.floor(1000 + Math.random() * 9000);
      trackingId = `CF-2026-${randomNum}`;
      existingReport = await prisma.report.findUnique({ where: { trackingId } });
    }

    let resolvedDept = department || 'Roads & Infrastructure';
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
            { step: 'Report Submitted', date: formattedDate, completed: true, current: false, order: 1 },
            { step: 'AI Issue Verification', date: formattedDate, completed: true, current: false, order: 2 },
            { step: 'Team Assignment', date: 'Pending', completed: false, current: true, order: 3 },
            { step: 'Issue Resolved', date: 'Pending', completed: false, current: false, order: 4 },
          ],
        },
      },
      include: {
        timeline: { orderBy: { order: 'asc' } },
      },
    });

    return res.status(201).json({
      message: 'Report created successfully',
      report: formatReport(report),
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// POST /api/reports/:id/support - Support an existing complaint (prevents duplicate tickets)
router.post('/:id/support', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || null;

    // 1. Verify target report exists in PostgreSQL database
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] },
      include: {
        timeline: { orderBy: { order: 'asc' } },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found with tracking ID: ' + id });
    }

    // 2. Perform support registration using Prisma transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      if (userId) {
        // Authenticated citizen check: prevent duplicate support from same user
        const existingUpvote = await tx.upvote.findUnique({
          where: {
            reportId_userId: {
              reportId: report.id,
              userId,
            },
          },
        });

        if (existingUpvote) {
          return {
            alreadySupported: true,
            message: `You have already supported complaint ${report.trackingId}.`,
            report,
          };
        }

        // Record citizen support in PostgreSQL
        await tx.upvote.create({
          data: {
            reportId: report.id,
            userId,
            ipAddress,
          },
        });

        // Increment complaint's support count atomically
        const updated = await tx.report.update({
          where: { id: report.id },
          data: { upvotesCount: { increment: 1 } },
          include: {
            timeline: { orderBy: { order: 'asc' } },
          },
        });

        return {
          alreadySupported: false,
          message: `Your support for complaint ${report.trackingId} has been registered!`,
          report: updated,
        };
      } else {
        // Anonymous support: check for recent support from same IP to curb spam
        if (ipAddress) {
          const recentVote = await tx.upvote.findFirst({
            where: {
              reportId: report.id,
              ipAddress,
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h window
              },
            },
          });

          if (recentVote) {
            return {
              alreadySupported: true,
              message: `Support from your network was already registered recently for ${report.trackingId}.`,
              report,
            };
          }
        }

        await tx.upvote.create({
          data: {
            reportId: report.id,
            userId: null,
            ipAddress,
          },
        });

        const updated = await tx.report.update({
          where: { id: report.id },
          data: { upvotesCount: { increment: 1 } },
          include: {
            timeline: { orderBy: { order: 'asc' } },
          },
        });

        return {
          alreadySupported: false,
          message: `Support for complaint ${report.trackingId} recorded successfully.`,
          report: updated,
        };
      }
    });

    return res.json({
      alreadySupported: result.alreadySupported,
      message: result.message,
      report: formatReport(result.report),
    });
  } catch (error) {
    console.error('Support report error:', error);
    return res.status(500).json({ error: 'Failed to record support for report.' });
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

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    // Synchronize timeline events according to status
    if (status === 'Assigned') {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Assignment' } },
        data: { completed: true, current: false, date: formattedDate },
      });
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Resolved' } },
        data: { completed: false, current: true },
      });
    } else if (status === 'In Progress') {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Assignment' } },
        data: { completed: true, current: false, date: formattedDate },
      });
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Resolved' } },
        data: { completed: false, current: true, note: 'Work in progress by assigned department' },
      });
    } else if (status === 'Resolved' || status === 'Closed') {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Assignment' } },
        data: { completed: true, current: false },
      });
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: 'Resolved' } },
        data: { completed: true, current: false, date: formattedDate, note: 'Resolved and verified by PMC' },
      });
    } else if (status === 'Rejected') {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id },
        data: { current: false },
      });
    }

    const refreshed = await prisma.report.findUnique({
      where: { id: report.id },
      include: { timeline: { orderBy: { order: 'asc' } } },
    });

    return res.json({ message: 'Status updated successfully', report: refreshed || updated });
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

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { department, status: 'Assigned' },
      include: { timeline: true },
    });

    await prisma.timelineEvent.updateMany({
      where: { reportId: report.id, step: { contains: 'Assignment' } },
      data: { completed: true, current: false, date: formattedDate, note: `Assigned to ${department}` },
    });
    await prisma.timelineEvent.updateMany({
      where: { reportId: report.id, step: { contains: 'Resolved' } },
      data: { current: true },
    });

    const refreshed = await prisma.report.findUnique({
      where: { id: report.id },
      include: { timeline: { orderBy: { order: 'asc' } } },
    });

    return res.json({ message: 'Department assigned successfully', report: refreshed || updated });
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

// DELETE /api/reports/:id - Delete report (citizen can only delete their own; officials can delete any)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Citizens can only delete their own reports
    if (req.user.role === 'citizen' && report.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You are not authorised to delete this report.' });
    }

    await prisma.report.delete({ where: { id: report.id } });
    return res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete report.' });
  }
});

export default router;
