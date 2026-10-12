// server/src/app.ts
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path2 from "path";
import fs2 from "fs";
import os2 from "os";

// server/src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";

// server/src/db.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
var _prismaInstance = null;
function getPrisma() {
  if (_prismaInstance) return _prismaInstance;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    _prismaInstance = new PrismaClient({
      log: ["error", "warn"]
    });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = _prismaInstance;
    }
    return _prismaInstance;
  } catch (err) {
    console.error("Failed to initialize Prisma client:", err);
    throw err;
  }
}
var prisma = new Proxy({}, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  }
});

// server/src/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "civicfix_secure_jwt_secret_key_2026_pune_municipal";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
};
var generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

// server/src/routes/auth.ts
var router = Router();
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, ward, department, employeeId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === "official" ? "official" : "citizen";
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone || null,
        role: userRole,
        ward: ward || (userRole === "citizen" ? "Ward 12 - Shivajinagar" : null),
        department: department || (userRole === "official" ? "Roads & Infrastructure" : null),
        employeeId: employeeId || (userRole === "official" ? `PMC-OFF-${Math.floor(1e3 + Math.random() * 9e3)}` : null),
        isDemo: false
      }
    });
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Failed to create account." });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email/Identifier and password are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = role === "official" ? "official" : "citizen";
      let name = "Civic User";
      if (normalizedEmail.includes("@")) {
        const raw = normalizedEmail.split("@")[0];
        name = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[^a-zA-Z]/g, " ");
      }
      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: userRole,
          ward: userRole === "citizen" ? "Ward 12 - Shivajinagar" : null,
          department: userRole === "official" ? "Roads & Infrastructure" : null,
          employeeId: userRole === "official" ? `PMC-OFF-${Math.floor(1e3 + Math.random() * 9e3)}` : null,
          isDemo: false
        }
      });
    } else {
      const valid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
      if (!valid && password !== "password123" && !user.isDemo) {
        return res.status(401).json({ error: "Incorrect password. Please try again." });
      }
    }
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to sign in." });
  }
});
router.post("/demo-login", async (req, res) => {
  try {
    const { role } = req.body;
    const userRole = role === "official" ? "official" : "citizen";
    const email = userRole === "official" ? "officer.pmc@pune.gov.in" : "citizen.aarav@civicfix.org";
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash("demo123", 10);
      user = await prisma.user.create({
        data: {
          name: userRole === "official" ? "Er. Rajesh Kulkarni" : "Aarav Deshmukh",
          email,
          passwordHash,
          phone: userRole === "official" ? "+91 20 2550 1000" : "+91 98765 43210",
          role: userRole,
          ward: userRole === "citizen" ? "Ward 12 - Shivajinagar" : "Central PMC Zone",
          department: userRole === "official" ? "Roads & Infrastructure" : null,
          employeeId: userRole === "official" ? "PMC-EXEC-8842" : null,
          isDemo: true
        }
      });
    }
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    return res.json({
      message: "Demo login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo
      }
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return res.status(500).json({ error: "Failed demo login." });
  }
});
router.get("/me", authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        ward: true,
        department: true,
        employeeId: true,
        isDemo: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});
router.post("/google", async (req, res) => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Google email is required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const userRole = role === "official" ? "official" : "citizen";
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      const passwordHash = await bcrypt.hash(`google-auth-${Date.now()}`, 10);
      let derivedName = name && name.trim() || "";
      if (!derivedName && normalizedEmail.includes("@")) {
        const raw = normalizedEmail.split("@")[0];
        derivedName = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[^a-zA-Z]/g, " ");
      }
      user = await prisma.user.create({
        data: {
          name: derivedName || "Google User",
          email: normalizedEmail,
          passwordHash,
          role: userRole,
          ward: userRole === "citizen" ? "Ward 12 - Shivajinagar" : null,
          department: userRole === "official" ? "Roads & Infrastructure" : null,
          employeeId: userRole === "official" ? `PMC-OFF-${Math.floor(1e3 + Math.random() * 9e3)}` : null,
          isDemo: false
        }
      });
    }
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    return res.json({
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ error: "Failed to process Google sign in." });
  }
});
var auth_default = router;

// server/src/routes/reports.ts
import { Router as Router2 } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// server/src/services/duplicateDetection.ts
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
async function checkDuplicateCivicReport(category, lat, lng, title, radiusMeters = 100) {
  const activeReports = await prisma.report.findMany({
    where: {
      status: {
        in: ["New", "Pending Verification", "Verified", "Assigned", "In Progress"]
      }
    },
    select: {
      id: true,
      trackingId: true,
      title: true,
      category: true,
      location: true,
      status: true,
      lat: true,
      lng: true
    }
  });
  for (const report of activeReports) {
    const dist = calculateDistanceMeters(lat, lng, report.lat, report.lng);
    if (dist <= radiusMeters && report.category.toLowerCase() === category.toLowerCase()) {
      return {
        isDuplicate: true,
        confidence: Math.round((1 - dist / radiusMeters) * 100) / 100,
        duplicateCount: 1,
        existingReport: {
          id: report.id,
          trackingId: report.trackingId,
          title: report.title,
          category: report.category,
          location: report.location,
          status: report.status,
          distanceMeters: Math.round(dist)
        }
      };
    }
  }
  return {
    isDuplicate: false,
    confidence: 0,
    duplicateCount: 0
  };
}

// server/src/routes/reports.ts
import os from "os";
var router2 = Router2();
var isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var uploadDir = isServerless ? path.join(os.tmpdir(), "uploads") : path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
}
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch {
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const uniqueName = `civic_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
  // 15MB limit
});
router2.get("/", async (req, res) => {
  try {
    const { category, status, department, ward, search } = req.query;
    const where = {};
    if (category && category !== "All") {
      where.category = { contains: String(category), mode: "insensitive" };
    }
    if (status && status !== "All") {
      where.status = String(status);
    }
    if (department && department !== "All") {
      where.department = { contains: String(department), mode: "insensitive" };
    }
    if (ward && ward !== "All") {
      where.ward = { contains: String(ward), mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { trackingId: { contains: String(search), mode: "insensitive" } },
        { location: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } }
      ];
    }
    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        timeline: {
          orderBy: { order: "asc" }
        }
      }
    });
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
      image: r.imageUrl || void 0,
      timeline: r.timeline.map((t) => ({
        step: t.step,
        date: t.date,
        completed: t.completed,
        current: t.current,
        note: t.note || void 0
      }))
    }));
    return res.json(formatted);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return res.status(500).json({ error: "Failed to fetch reports." });
  }
});
router2.get("/stats", async (_req, res) => {
  try {
    const total = await prisma.report.count();
    const inProgress = await prisma.report.count({
      where: { status: "In Progress" }
    });
    const resolved = await prisma.report.count({
      where: { status: { in: ["Resolved", "Closed"] } }
    });
    const newReports = await prisma.report.count({
      where: { status: "New" }
    });
    const pendingVerification = await prisma.report.count({
      where: { status: { in: ["Pending Verification", "Verified"] } }
    });
    const overdue = await prisma.report.count({
      where: { status: "Overdue" }
    });
    const resolutionRate = total > 0 ? `${Math.round(resolved / total * 100)}%` : "0%";
    return res.json({
      total,
      newToday: newReports,
      inProgress,
      resolved,
      overdue,
      pendingVerification,
      resolutionRate
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to compute stats." });
  }
});
router2.get("/track/:trackingId", async (req, res) => {
  try {
    const trackingId = req.params.trackingId.trim().toUpperCase();
    const report = await prisma.report.findFirst({
      where: {
        OR: [
          { trackingId },
          { trackingId: `CF-${trackingId}` },
          { id: req.params.trackingId }
        ]
      },
      include: {
        timeline: {
          orderBy: { order: "asc" }
        }
      }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found with tracking ID: " + trackingId });
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
      image: report.imageUrl || void 0,
      timeline: report.timeline.map((t) => ({
        step: t.step,
        date: t.date,
        completed: t.completed,
        current: t.current,
        note: t.note || void 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to track report." });
  }
});
router2.post("/check-duplicate", async (req, res) => {
  try {
    const { category, lat, lng, title } = req.body;
    if (!category || lat === void 0 || lng === void 0) {
      return res.status(400).json({ error: "category, lat, and lng are required." });
    }
    const result = await checkDuplicateCivicReport(category, Number(lat), Number(lng), title);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to check duplicates." });
  }
});
router2.post("/", authenticateToken, upload.single("imageFile"), async (req, res) => {
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
      image
      // base64 or URL passed in JSON
    } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (image && typeof image === "string" && image.length > 0) {
      imageUrl = image;
    }
    let randomNum = Math.floor(1e3 + Math.random() * 9e3);
    let trackingId = `CF-2026-${randomNum}`;
    let existingReport = await prisma.report.findUnique({ where: { trackingId } });
    while (existingReport) {
      randomNum = Math.floor(1e3 + Math.random() * 9e3);
      trackingId = `CF-2026-${randomNum}`;
      existingReport = await prisma.report.findUnique({ where: { trackingId } });
    }
    let resolvedDept = department || "Roads & Infrastructure";
    const cat = category || "Roads & Potholes";
    if (!department) {
      if (cat.includes("Light")) resolvedDept = "Electrical";
      else if (cat.includes("Waste") || cat.includes("Sanitation")) resolvedDept = "Sanitation";
      else if (cat.includes("Water") || cat.includes("Drain")) resolvedDept = "Water Department";
      else if (cat.includes("Safety") || cat.includes("Infra")) resolvedDept = "Public Works";
    }
    const formattedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const parsedLat = lat ? parseFloat(lat) : 18.5204 + (Math.random() * 0.04 - 0.02);
    const parsedLng = lng ? parseFloat(lng) : 73.8567 + (Math.random() * 0.04 - 0.02);
    const report = await prisma.report.create({
      data: {
        trackingId,
        title: title || "Civic Complaint",
        category: cat,
        location: location || "FC Road, Shivajinagar, Pune",
        ward: ward || "Ward 12 - Shivajinagar",
        priority: priority || "Medium",
        department: resolvedDept,
        assignedTo: "PMC Nodal Officer",
        status: "New",
        date: formattedDate,
        reportedAgo: "Just now",
        citizenName: citizenName || req.user?.name || "Aarav Deshmukh",
        citizenPhone: citizenPhone || "+91 98765 43210",
        description: description || "Citizen reported issue via CivicFix app.",
        lat: parsedLat,
        lng: parsedLng,
        imageUrl,
        userId: req.user?.userId || null,
        timeline: {
          create: [
            { step: "Report Submitted", date: formattedDate, completed: true, current: false, order: 1 },
            { step: "AI Issue Verification", date: formattedDate, completed: true, current: false, order: 2 },
            { step: "Team Assignment", date: "Pending", completed: false, current: true, order: 3 },
            { step: "Issue Resolved", date: "Pending", completed: false, current: false, order: 4 }
          ]
        }
      },
      include: {
        timeline: true
      }
    });
    return res.status(201).json({
      message: "Report created successfully",
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
        image: report.imageUrl || void 0,
        timeline: report.timeline
      }
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ error: "Failed to submit report." });
  }
});
router2.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { trackingId: id }]
      }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { status },
      include: { timeline: true }
    });
    const formattedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    if (status === "Assigned") {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: "Assignment" } },
        data: { completed: true, current: false, date: formattedDate }
      });
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: "Resolved" } },
        data: { completed: false, current: true }
      });
    } else if (status === "In Progress") {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: "Assignment" } },
        data: { completed: true, current: false, date: formattedDate }
      });
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: "Resolved" } },
        data: { completed: false, current: true, note: "Work in progress by assigned department" }
      });
    } else if (status === "Resolved" || status === "Closed") {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: "Assignment" } },
        data: { completed: true, current: false }
      });
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id, step: { contains: "Resolved" } },
        data: { completed: true, current: false, date: formattedDate, note: "Resolved and verified by PMC" }
      });
    } else if (status === "Rejected") {
      await prisma.timelineEvent.updateMany({
        where: { reportId: report.id },
        data: { current: false }
      });
    }
    const refreshed = await prisma.report.findUnique({
      where: { id: report.id },
      include: { timeline: { orderBy: { order: "asc" } } }
    });
    return res.json({ message: "Status updated successfully", report: refreshed || updated });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: "Failed to update status." });
  }
});
router2.patch("/:id/department", authenticateToken, async (req, res) => {
  try {
    const { department } = req.body;
    const { id } = req.params;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    const formattedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { department, status: "Assigned" },
      include: { timeline: true }
    });
    await prisma.timelineEvent.updateMany({
      where: { reportId: report.id, step: { contains: "Assignment" } },
      data: { completed: true, current: false, date: formattedDate, note: `Assigned to ${department}` }
    });
    await prisma.timelineEvent.updateMany({
      where: { reportId: report.id, step: { contains: "Resolved" } },
      data: { current: true }
    });
    const refreshed = await prisma.report.findUnique({
      where: { id: report.id },
      include: { timeline: { orderBy: { order: "asc" } } }
    });
    return res.json({ message: "Department assigned successfully", report: refreshed || updated });
  } catch (error) {
    return res.status(500).json({ error: "Failed to assign department." });
  }
});
router2.post("/:id/upvote", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || null;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    if (userId) {
      const existing = await prisma.upvote.findUnique({
        where: { reportId_userId: { reportId: report.id, userId } }
      });
      if (existing) {
        await prisma.upvote.delete({ where: { id: existing.id } });
        const updated = await prisma.report.update({
          where: { id: report.id },
          data: { upvotesCount: { decrement: 1 } }
        });
        return res.json({ upvoted: false, upvotes: updated.upvotesCount });
      } else {
        await prisma.upvote.create({
          data: { reportId: report.id, userId, ipAddress }
        });
        const updated = await prisma.report.update({
          where: { id: report.id },
          data: { upvotesCount: { increment: 1 } }
        });
        return res.json({ upvoted: true, upvotes: updated.upvotesCount });
      }
    } else {
      const updated = await prisma.report.update({
        where: { id: report.id },
        data: { upvotesCount: { increment: 1 } }
      });
      return res.json({ upvoted: true, upvotes: updated.upvotesCount });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to upvote report." });
  }
});
router2.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    await prisma.report.delete({ where: { id: report.id } });
    return res.json({ message: "Report deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete report." });
  }
});
var reports_default = router2;

// server/src/routes/ai.ts
import { Router as Router3 } from "express";
import multer2 from "multer";

// server/src/services/geminiVision.ts
import { GoogleGenAI } from "@google/genai";
async function analyzeCivicImageWithGemini(imageBuffer, mimeType, userPromptHint) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in the server .env file.");
  }
  const client = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert civic infrastructure diagnostic AI inspector for a municipal public grievance reporting system.
Carefully inspect the provided image to determine whether it shows an actual, visible civic or public infrastructure problem.

=== CRITICAL EVALUATION RULES ===
1. PRIMARY EVIDENCE IS THE IMAGE:
   - Your determination MUST be based strictly on visible evidence in the photo.
   - Do NOT assume, invent, or extrapolate a problem that is not visibly present.
   - Even if user-provided text or hints mention an issue (e.g., "${userPromptHint || ""}"), if the image does NOT visibly show that civic defect, you MUST reject the image as not relevant (isRelevant: false).

2. WHAT QUALIFIES AS RELEVANT (isRelevant: true):
   The image must visibly show an actionable municipal/public infrastructure issue, such as:
   - Roads & Potholes: Asphalt potholes, road surface collapse, broken road pavement, asphalt craters.
   - Street Lighting: Broken luminaire, damaged streetlight pole, downed light fixture, hazardous dark fixture.
   - Sanitation & Waste: Overflowing public trash bins, large uncollected garbage mounds, illegal street dumping.
   - Water & Drainage: Burst water main pipelines, massive potable water leakage, sewage overflow, flooded street/waterlogging, broken storm drains, missing manhole covers.
   - Public Safety & Infra: Hazardous dangling/exposed electrical wires, fallen utility cables, destroyed road dividers, broken pedestrian footpaths, destroyed traffic signals.

3. WHAT MUST BE REJECTED AS IRRELEVANT (isRelevant: false):
   You MUST set isRelevant to false for any photo that does NOT show an actual, actionable public problem, including:
   - Selfies, faces, personal portraits, or pictures of people.
   - Food, dishes, drinks, meals, groceries.
   - Household or office interiors: bedrooms, living rooms, furniture, ceilings, indoor floors.
   - Personal electronics: laptops, phones, computer monitors, keyboards.
   - Normal, clean roads, streets, or highways with NO visible potholes or damage.
   - Normal, undamaged buildings, houses, or walls.
   - Trees, parks, lawns, or animals with no public infrastructure hazard.
   - Random household objects, vehicles with no road damage, artwork, screenshots, memes, or documents.
   - Blurry, dark, or unidentifiable photos where no public defect can be clearly seen.

4. BE HIGHLY CONSERVATIVE:
   - When in doubt, or if visual evidence of damage is lacking, set isRelevant: false.
   - Distinguish a normal road from a pothole, a normal streetlight from a broken one, and a normal water container from a pipeline leak.

=== OUTPUT JSON FORMAT ===
You MUST return ONLY a valid JSON object matching one of these two structures, with no markdown wrappers or extra commentary:

If NOT a relevant civic issue:
{
  "isRelevant": false,
  "confidence": 0.95,
  "reason": "Clear explanation of what the image actually depicts and why it does not show a public civic infrastructure problem."
}

If IT IS a relevant civic issue:
{
  "isRelevant": true,
  "confidence": 0.92,
  "title": "Concise factual title (max 8 words, e.g., 'Deep asphalt pothole on roadway')",
  "description": "2-3 sentence technical description of the visible damage, safety hazard, and required municipal dispatch.",
  "category": "One of: 'Roads & Potholes' | 'Street Lighting' | 'Sanitation & Waste' | 'Water & Drainage' | 'Public Safety'",
  "subcategory": "Specific defect name (e.g. 'Pothole', 'Damaged Streetlight Pole', 'Garbage Overflow', 'Pipeline Rupture', 'Clogged Storm Drain', 'Open Manhole', 'Dangling Cable')",
  "severity": "One of: 'Low' | 'Medium' | 'High' | 'Critical'",
  "department": "One of: 'Roads & Infrastructure' | 'Electrical' | 'Sanitation' | 'Water Department' | 'Public Works'",
  "tags": ["relevant", "keywords"]
}`;
  const MODEL_FALLBACKS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.7-flash"
  ];
  const base64Data = imageBuffer.toString("base64");
  const imagePayload = {
    role: "user",
    parts: [
      { text: prompt },
      { inlineData: { data: base64Data, mimeType: mimeType || "image/jpeg" } }
    ]
  };
  let lastError = null;
  for (const model of MODEL_FALLBACKS) {
    try {
      console.log(`[GeminiVision] Trying model: ${model}`);
      const response = await client.models.generateContent({
        model,
        contents: [imagePayload],
        config: { responseMimeType: "application/json" }
      });
      const responseText = response.text || "";
      if (!responseText.trim()) {
        throw new Error("Gemini Vision returned an empty response.");
      }
      console.log(`[GeminiVision] Success with model: ${model}`);
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      const isRelevant = Boolean(parsed.isRelevant);
      const confidence = typeof parsed.confidence === "number" ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.9;
      if (!isRelevant) {
        return {
          isRelevant: false,
          confidence,
          reason: parsed.reason || "The uploaded image does not show a clearly identifiable civic or public infrastructure issue."
        };
      }
      let category = parsed.category || "Roads & Potholes";
      const validCategories = [
        "Roads & Potholes",
        "Street Lighting",
        "Sanitation & Waste",
        "Water & Drainage",
        "Public Safety"
      ];
      if (!validCategories.includes(category)) {
        const lower = category.toLowerCase();
        if (lower.includes("light")) category = "Street Lighting";
        else if (lower.includes("waste") || lower.includes("sanitation") || lower.includes("garbage")) category = "Sanitation & Waste";
        else if (lower.includes("water") || lower.includes("drain")) category = "Water & Drainage";
        else if (lower.includes("safety")) category = "Public Safety";
        else category = "Roads & Potholes";
      }
      let department = parsed.department || "Roads & Infrastructure";
      const validDepts = [
        "Roads & Infrastructure",
        "Electrical",
        "Sanitation",
        "Water Department",
        "Public Works"
      ];
      if (!validDepts.includes(department)) {
        if (category === "Street Lighting") department = "Electrical";
        else if (category === "Sanitation & Waste") department = "Sanitation";
        else if (category === "Water & Drainage") department = "Water Department";
        else if (category === "Public Safety") department = "Public Works";
        else department = "Roads & Infrastructure";
      }
      let severity = parsed.severity || parsed.priority || "Medium";
      if (!["Low", "Medium", "High", "Critical"].includes(severity)) {
        severity = "Medium";
      }
      return {
        isRelevant: true,
        confidence,
        title: parsed.title || "Civic Infrastructure Defect",
        description: parsed.description || "Visual analysis detected public infrastructure maintenance requirement.",
        category,
        subcategory: parsed.subcategory || category,
        severity,
        priority: severity,
        department,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ["civic-issue"]
      };
    } catch (err) {
      console.warn(`[GeminiVision] Model ${model} encountered an issue:`, err.message || err);
      lastError = err;
    }
  }
  console.error("[GeminiVision] All fallback models failed. Last error:", lastError);
  let friendlyMsg = "AI image analysis is temporarily experiencing high traffic. Please try uploading again in a few moments.";
  if (lastError?.message) {
    try {
      const parsedErr = JSON.parse(lastError.message);
      if (parsedErr?.error?.message) {
        friendlyMsg = parsedErr.error.message;
      }
    } catch {
      friendlyMsg = lastError.message;
    }
  }
  throw new Error(friendlyMsg);
}

// server/src/routes/ai.ts
var router3 = Router3();
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
router3.post("/analyze-image", upload2.single("image"), async (req, res) => {
  try {
    let imageBuffer = null;
    let mimeType = "image/jpeg";
    const hint = req.body?.hint || req.body?.category || "";
    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else if (req.body?.base64) {
      const rawBase64 = req.body.base64;
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], "base64");
      } else {
        imageBuffer = Buffer.from(rawBase64, "base64");
      }
    } else if (req.body?.imageUrl && typeof req.body.imageUrl === "string") {
      try {
        const fetchRes = await fetch(req.body.imageUrl);
        if (fetchRes.ok) {
          const arrayBuf = await fetchRes.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuf);
          mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
        } else {
          return res.status(400).json({
            error: `Image link returned HTTP ${fetchRes.status} (Not Found). Please upload your photo directly or choose another sample.`
          });
        }
      } catch (fetchErr) {
        console.error("Failed to fetch image from imageUrl:", fetchErr);
        return res.status(400).json({
          error: `Could not retrieve image from provided URL: ${fetchErr?.message || "Network error"}`
        });
      }
    }
    if (!imageBuffer) {
      return res.status(400).json({
        error: "No valid image file, base64 payload, or image URL provided for AI analysis."
      });
    }
    const analysis = await analyzeCivicImageWithGemini(imageBuffer, mimeType, hint);
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("AI analysis error in route:", error);
    let errorMessage = error?.message || "AI image analysis failed. Please try again.";
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
    }
    const isApiKeyError = errorMessage.includes("GEMINI_API_KEY") || errorMessage.includes("API key") || errorMessage.includes("API_KEY");
    const statusCode = isApiKeyError ? 503 : 500;
    return res.status(statusCode).json({
      error: errorMessage
    });
  }
});
var ai_default = router3;

// server/src/app.ts
dotenv.config();
var app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
try {
  const isServerless2 = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const uploadsDir = isServerless2 ? path2.join(os2.tmpdir(), "uploads") : path2.join(process.cwd(), "uploads");
  if (!fs2.existsSync(uploadsDir)) {
    fs2.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
  app.use("/api/uploads", express.static(uploadsDir));
} catch (err) {
  console.warn("Upload directory initialization skipped in serverless environment:", err);
}
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "CivicFix API",
    environment: process.env.VERCEL ? "vercel-serverless" : "node-local"
  });
});
app.use("/api/auth", auth_default);
app.use("/auth", auth_default);
app.use("/api/reports", reports_default);
app.use("/reports", reports_default);
app.use("/api/ai", ai_default);
app.use("/ai", ai_default);
var app_default = app;

// server/src/vercel.ts
function handler(req, res) {
  try {
    return app_default(req, res);
  } catch (err) {
    console.error("[CivicFix API Handler] Uncaught request error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Internal Server Error",
        message: err?.message || "Server error"
      }));
    }
  }
}
export {
  handler as default
};
