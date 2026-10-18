// server/src/app.ts
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path3 from "path";
import fs3 from "fs";
import os3 from "os";

// server/src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email/Identifier and password are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      return res.status(401).json({ error: "No account found with that email. Please register first." });
    }
    const valid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!valid && !user.isDemo) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
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
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;
    if (!tokenToVerify) {
      return res.status(400).json({ error: "Google ID token is required for authentication." });
    }
    const currentGoogleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!currentGoogleClientId) {
      return res.status(503).json({
        error: "Google Sign-In is not configured on the server. Please set GOOGLE_CLIENT_ID in server environment."
      });
    }
    const googleClient = new OAuth2Client(currentGoogleClientId);
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: currentGoogleClientId
      });
    } catch (verifyError) {
      console.warn("Google token verification failed:", verifyError?.message || "Invalid token");
      return res.status(401).json({
        error: "Invalid or expired Google authentication token. Please sign in again."
      });
    }
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: "Failed to extract verified identity from Google token." });
    }
    const googleSub = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified;
    if (!googleSub || !email) {
      return res.status(400).json({ error: "Google account missing verified user identifier or email." });
    }
    if (!emailVerified) {
      return res.status(403).json({
        error: "Google email address is not verified. Please verify your Google account email first."
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const googleDisplayName = payload.name && payload.name.trim() || (payload.given_name ? `${payload.given_name} ${payload.family_name || ""}`.trim() : "") || normalizedEmail.split("@")[0];
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      const unusablePasswordHash = await bcrypt.hash(`oauth_google_${crypto.randomUUID()}_${Date.now()}`, 10);
      const userRole = "citizen";
      user = await prisma.user.create({
        data: {
          name: googleDisplayName,
          email: normalizedEmail,
          passwordHash: unusablePasswordHash,
          role: userRole,
          ward: "Ward 12 - Shivajinagar",
          department: null,
          employeeId: null,
          isDemo: false
        }
      });
    } else {
      if (!user.name || user.name === "Civic User" || user.name === "Google User") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: googleDisplayName }
        });
      }
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
    console.error("Internal Google auth error:", error?.message || "Unknown error");
    return res.status(500).json({ error: "Authentication service encountered an unexpected error." });
  }
});
var auth_default = router;

// server/src/routes/reports.ts
import { Router as Router2 } from "express";
import multer from "multer";
import path2 from "path";
import fs2 from "fs";

// server/src/services/duplicateDetection.ts
import path from "path";
import fs from "fs";
import os from "os";

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
async function compareCivicImagesWithGemini(image1Buffer, mimeType1, image2Buffer, mimeType2) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  const client = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert civic infrastructure diagnostic AI inspector.
Compare the two provided images (Image 1 and Image 2) taken in the same geographic vicinity.
Determine whether Image 1 and Image 2 depict the EXACT SAME physical civic infrastructure defect (e.g. the same physical pothole on the road surface, the same broken streetlight pole, the same garbage mound, the same leaking pipe rupture) or TWO DIFFERENT distinct defects at nearby locations.

Carefully examine:
1. Defect morphology (shape, crater depth, surrounding pavement cracks, curb features, road markings, size).
2. Background context, lighting, and surrounding environment.
3. Distinguish whether differences are simply due to camera perspective/angles of the same defect vs. two separate defects.

Return ONLY a valid JSON object matching this structure with no markdown code blocks:
{
  "isSameDefect": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "Detailed concise explanation of the visual comparison and defect matching rationale."
}`;
  const MODEL_FALLBACKS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.7-flash"
  ];
  const base64_1 = image1Buffer.toString("base64");
  const base64_2 = image2Buffer.toString("base64");
  const contentPayload = {
    role: "user",
    parts: [
      { text: prompt },
      { inlineData: { data: base64_1, mimeType: mimeType1 || "image/jpeg" } },
      { inlineData: { data: base64_2, mimeType: mimeType2 || "image/jpeg" } }
    ]
  };
  for (const model of MODEL_FALLBACKS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [contentPayload],
        config: { responseMimeType: "application/json" }
      });
      const responseText = response.text || "";
      if (!responseText.trim()) {
        continue;
      }
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      const isSameDefect = Boolean(parsed.isSameDefect);
      const confidence = typeof parsed.confidence === "number" ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.8;
      return {
        isSameDefect,
        confidence,
        reason: parsed.reason || "Visual comparison completed."
      };
    } catch (err) {
      console.warn(`[GeminiVision] Compare model ${model} issue:`, err?.message || err);
    }
  }
  return null;
}

// server/src/services/duplicateDetection.ts
var DEFAULT_DUPLICATE_RADIUS_METERS = process.env.DUPLICATE_RADIUS_METERS ? parseFloat(process.env.DUPLICATE_RADIUS_METERS) : 45;
var STOP_WORDS = /* @__PURE__ */ new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "it",
  "this",
  "that",
  "from",
  "near",
  "pune",
  "civic",
  "fix",
  "pmc",
  "area",
  "road",
  "street",
  "lane",
  "issue",
  "problem",
  "report",
  "complaint",
  "reported",
  "detected",
  "analysis",
  "immediate",
  "please",
  "requiring"
]);
var DEFECT_KEYWORDS = /* @__PURE__ */ new Set([
  // Roads
  "pothole",
  "potholes",
  "crater",
  "asphalt",
  "cavity",
  "tarmac",
  "sinkhole",
  "divider",
  "footpath",
  "sidewalk",
  // Lighting
  "streetlight",
  "light",
  "pole",
  "lamp",
  "luminaire",
  "illumination",
  "bulb",
  "dark",
  "lighting",
  // Sanitation
  "garbage",
  "waste",
  "trash",
  "dump",
  "overflow",
  "debris",
  "bin",
  "litter",
  "sanitation",
  "spilling",
  // Drainage & Water
  "water",
  "leak",
  "leakage",
  "pipe",
  "pipeline",
  "drain",
  "drainage",
  "manhole",
  "sewage",
  "flooding",
  "burst",
  "waterlogging",
  // Safety
  "wire",
  "wires",
  "cable",
  "transformer",
  "hazard",
  "safety",
  "danger"
]);
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
function tokenize(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(clean);
}
function computeTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  let intersectionCount = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  }
  const unionCount = tokens1.size + tokens2.size - intersectionCount;
  const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;
  const defects1 = [...tokens1].filter((w) => DEFECT_KEYWORDS.has(w));
  const defects2 = [...tokens2].filter((w) => DEFECT_KEYWORDS.has(w));
  let defectMatch = 0;
  if (defects1.length > 0 && defects2.length > 0) {
    const commonDefects = defects1.filter((d) => defects2.includes(d));
    defectMatch = commonDefects.length / Math.max(defects1.length, defects2.length);
  }
  return Math.min(1, jaccard * 0.4 + defectMatch * 0.6);
}
async function getImageBuffer(imageUrl, directBuffer, directMime) {
  if (directBuffer && directBuffer.length > 0) {
    return { buffer: directBuffer, mimeType: directMime || "image/jpeg" };
  }
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith("data:")) {
      const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return {
          mimeType: matches[1],
          buffer: Buffer.from(matches[2], "base64")
        };
      }
    }
    if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("uploads/")) {
      const fileName = path.basename(imageUrl);
      const isServerless2 = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const uploadDir2 = isServerless2 ? path.join(os.tmpdir(), "uploads") : path.join(process.cwd(), "uploads");
      const filePath = path.join(uploadDir2, fileName);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(fileName).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return {
          buffer: fs.readFileSync(filePath),
          mimeType
        };
      }
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const mimeType = res.headers.get("content-type") || "image/jpeg";
        return {
          buffer: Buffer.from(arrayBuf),
          mimeType
        };
      }
    }
  } catch (err) {
    console.warn("[DuplicateDetection] Failed to fetch report image:", err);
  }
  return null;
}
async function checkDuplicateCivicReport(categoryOrOptions, lat, lng, title, radiusMeters) {
  let opts;
  if (typeof categoryOrOptions === "object") {
    opts = categoryOrOptions;
  } else {
    opts = {
      category: categoryOrOptions,
      lat: lat ?? 0,
      lng: lng ?? 0,
      title: title || "",
      radiusMeters: radiusMeters ?? DEFAULT_DUPLICATE_RADIUS_METERS
    };
  }
  const effectiveRadius = opts.radiusMeters || DEFAULT_DUPLICATE_RADIUS_METERS;
  const targetCategory = (opts.category || "").trim().toLowerCase();
  const targetText = `${opts.title || ""} ${opts.description || ""}`.trim();
  if (isNaN(opts.lat) || isNaN(opts.lng) || opts.lat === 0 || opts.lng === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      duplicateCount: 0,
      isCertainMatch: false
    };
  }
  const activeReports = await prisma.report.findMany({
    where: {
      status: {
        in: ["New", "Pending Verification", "Verified", "Assigned", "In Progress", "Overdue"]
      },
      ...opts.excludeReportId ? { id: { not: opts.excludeReportId } } : {}
    },
    select: {
      id: true,
      trackingId: true,
      title: true,
      category: true,
      location: true,
      status: true,
      lat: true,
      lng: true,
      description: true,
      imageUrl: true,
      upvotesCount: true,
      date: true,
      reportedAgo: true
    }
  });
  if (activeReports.length === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      duplicateCount: 0,
      isCertainMatch: false
    };
  }
  const candidates = [];
  let newImageInfo = null;
  if (opts.imageBuffer || opts.imageUrl) {
    newImageInfo = await getImageBuffer(opts.imageUrl, opts.imageBuffer, opts.imageMimeType);
  }
  for (const report of activeReports) {
    const dist = calculateDistanceMeters(opts.lat, opts.lng, report.lat, report.lng);
    if (dist > effectiveRadius) {
      continue;
    }
    const reportCategory = report.category.trim().toLowerCase();
    const categoriesMatch = reportCategory === targetCategory || reportCategory.includes("road") && targetCategory.includes("road") || reportCategory.includes("light") && targetCategory.includes("light") || reportCategory.includes("waste") && targetCategory.includes("waste") || reportCategory.includes("water") && targetCategory.includes("water");
    if (!categoriesMatch) {
      continue;
    }
    const proximityScore = Math.max(0, 1 - dist / effectiveRadius);
    const reportText = `${report.title} ${report.description}`.trim();
    const textSimilarity = computeTextSimilarity(targetText, reportText);
    let visualComparison = null;
    if (newImageInfo && report.imageUrl) {
      const existingImageInfo = await getImageBuffer(report.imageUrl);
      if (existingImageInfo) {
        try {
          visualComparison = await compareCivicImagesWithGemini(
            newImageInfo.buffer,
            newImageInfo.mimeType,
            existingImageInfo.buffer,
            existingImageInfo.mimeType
          );
        } catch (err) {
          console.warn("[DuplicateDetection] Visual comparison error:", err);
        }
      }
    }
    let overallConfidence = 0;
    let isCertain = false;
    let reason = "";
    if (visualComparison !== null) {
      if (visualComparison.isSameDefect) {
        overallConfidence = Math.min(
          1,
          0.3 * proximityScore + 0.25 * textSimilarity + 0.45 * visualComparison.confidence
        );
        isCertain = visualComparison.confidence >= 0.75;
        reason = `Identified matching physical defect ${Math.round(dist)}m away. ${visualComparison.reason}`;
      } else {
        overallConfidence = Math.max(0, 0.25 * proximityScore + 0.15 * textSimilarity);
        isCertain = false;
        reason = `Located nearby (${Math.round(dist)}m), but visual analysis indicates separate defects: ${visualComparison.reason}`;
      }
    } else {
      overallConfidence = Math.min(1, 0.55 * proximityScore + 0.45 * textSimilarity);
      isCertain = false;
      reason = `Potential duplicate within ${Math.round(dist)}m in ${report.category}. Visual comparison could not be definitively confirmed.`;
    }
    if (overallConfidence >= 0.4 || proximityScore >= 0.6 && textSimilarity >= 0.2) {
      candidates.push({
        report,
        distanceMeters: Math.round(dist),
        proximityScore,
        textSimilarity,
        visualComparison,
        overallConfidence: Math.round(overallConfidence * 100) / 100,
        isCertain,
        reason
      });
    }
  }
  if (candidates.length === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      duplicateCount: 0,
      isCertainMatch: false
    };
  }
  candidates.sort((a, b) => b.overallConfidence - a.overallConfidence);
  const bestMatch = candidates[0];
  return {
    isDuplicate: true,
    confidence: bestMatch.overallConfidence,
    duplicateCount: candidates.length,
    isCertainMatch: bestMatch.isCertain,
    matchReason: bestMatch.reason,
    existingReport: {
      id: bestMatch.report.id,
      trackingId: bestMatch.report.trackingId,
      title: bestMatch.report.title,
      category: bestMatch.report.category,
      location: bestMatch.report.location,
      status: bestMatch.report.status,
      distanceMeters: bestMatch.distanceMeters,
      upvotes: bestMatch.report.upvotesCount,
      imageUrl: bestMatch.report.imageUrl || void 0,
      date: bestMatch.report.date,
      reportedAgo: bestMatch.report.reportedAgo,
      description: bestMatch.report.description
    }
  };
}

// server/src/routes/reports.ts
import os2 from "os";
var router2 = Router2();
var isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var uploadDir = isServerless ? path2.join(os2.tmpdir(), "uploads") : path2.join(process.cwd(), "uploads");
try {
  if (!fs2.existsSync(uploadDir)) {
    fs2.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
}
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs2.existsSync(uploadDir)) {
        fs2.mkdirSync(uploadDir, { recursive: true });
      }
    } catch {
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path2.extname(file.originalname) || ".jpg";
    const uniqueName = `civic_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
  // 15MB limit
});
function formatReport(r) {
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
    image: r.imageUrl || void 0,
    timeline: (r.timeline || []).map((t) => ({
      step: t.step,
      date: t.date,
      completed: t.completed,
      current: t.current,
      note: t.note || void 0
    }))
  };
}
router2.get("/my", authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required. Please sign in to view your reports." });
  }
  try {
    const userId = req.user.userId;
    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        timeline: {
          orderBy: { order: "asc" }
        }
      }
    });
    return res.json(reports.map(formatReport));
  } catch (error) {
    console.error("Fetch my reports error:", error);
    return res.status(500).json({ error: "Failed to fetch your reports." });
  }
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
    const formatted = reports.map(formatReport);
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
    return res.json(formatReport(report));
  } catch (error) {
    return res.status(500).json({ error: "Failed to track report." });
  }
});
router2.post("/check-duplicate", async (req, res) => {
  try {
    const { category, lat, lng, title, description, imageUrl, radiusMeters } = req.body;
    if (!category || lat === void 0 || lng === void 0) {
      return res.status(400).json({ error: "category, lat, and lng are required." });
    }
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: "lat and lng must be valid numbers." });
    }
    const result = await checkDuplicateCivicReport({
      category: String(category),
      lat: parsedLat,
      lng: parsedLng,
      title: title ? String(title) : void 0,
      description: description ? String(description) : void 0,
      imageUrl: imageUrl ? String(imageUrl) : void 0,
      radiusMeters: radiusMeters !== void 0 ? parseFloat(radiusMeters) : void 0
    });
    return res.json(result);
  } catch (error) {
    console.error("Check duplicate error:", error);
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
      image,
      // base64 or URL passed in JSON
      forceNew
      // when true, user confirmed separate submission despite duplicate detection
    } = req.body;
    const shouldForceNew = forceNew === true || forceNew === "true" || forceNew === 1 || forceNew === "1";
    let imageUrl = null;
    let imageBuffer = void 0;
    let imageMimeType = void 0;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      try {
        if (req.file.path && fs2.existsSync(req.file.path)) {
          imageBuffer = fs2.readFileSync(req.file.path);
          imageMimeType = req.file.mimetype;
        }
      } catch (fErr) {
        console.warn("Could not read uploaded file buffer for duplicate comparison:", fErr);
      }
    } else if (image && typeof image === "string" && image.length > 0) {
      imageUrl = image;
      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          imageMimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], "base64");
        }
      }
    }
    const cat = category || "Roads & Potholes";
    const parsedLat = lat !== void 0 && lat !== "" ? parseFloat(lat) : 18.5204 + (Math.random() * 0.04 - 0.02);
    const parsedLng = lng !== void 0 && lng !== "" ? parseFloat(lng) : 73.8567 + (Math.random() * 0.04 - 0.02);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: "Invalid geographic coordinates provided." });
    }
    if (!shouldForceNew) {
      const duplicateResult = await checkDuplicateCivicReport({
        category: cat,
        lat: parsedLat,
        lng: parsedLng,
        title: title || "",
        description: description || "",
        imageBuffer,
        imageMimeType,
        imageUrl: imageUrl || void 0
      });
      if (duplicateResult.isDuplicate && duplicateResult.existingReport) {
        return res.status(200).json({
          potentialDuplicate: true,
          message: "A potential duplicate civic report was identified at this location.",
          confidence: duplicateResult.confidence,
          isCertainMatch: duplicateResult.isCertainMatch,
          matchReason: duplicateResult.matchReason,
          existingReport: duplicateResult.existingReport
        });
      }
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
        timeline: { orderBy: { order: "asc" } }
      }
    });
    return res.status(201).json({
      message: "Report created successfully",
      report: formatReport(report)
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ error: "Failed to submit report." });
  }
});
router2.post("/:id/support", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || null;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] },
      include: {
        timeline: { orderBy: { order: "asc" } }
      }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found with tracking ID: " + id });
    }
    const result = await prisma.$transaction(async (tx) => {
      if (userId) {
        const existingUpvote = await tx.upvote.findUnique({
          where: {
            reportId_userId: {
              reportId: report.id,
              userId
            }
          }
        });
        if (existingUpvote) {
          return {
            alreadySupported: true,
            message: `You have already supported complaint ${report.trackingId}.`,
            report
          };
        }
        await tx.upvote.create({
          data: {
            reportId: report.id,
            userId,
            ipAddress
          }
        });
        const updated = await tx.report.update({
          where: { id: report.id },
          data: { upvotesCount: { increment: 1 } },
          include: {
            timeline: { orderBy: { order: "asc" } }
          }
        });
        return {
          alreadySupported: false,
          message: `Your support for complaint ${report.trackingId} has been registered!`,
          report: updated
        };
      } else {
        if (ipAddress) {
          const recentVote = await tx.upvote.findFirst({
            where: {
              reportId: report.id,
              ipAddress,
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1e3)
                // 24h window
              }
            }
          });
          if (recentVote) {
            return {
              alreadySupported: true,
              message: `Support from your network was already registered recently for ${report.trackingId}.`,
              report
            };
          }
        }
        await tx.upvote.create({
          data: {
            reportId: report.id,
            userId: null,
            ipAddress
          }
        });
        const updated = await tx.report.update({
          where: { id: report.id },
          data: { upvotesCount: { increment: 1 } },
          include: {
            timeline: { orderBy: { order: "asc" } }
          }
        });
        return {
          alreadySupported: false,
          message: `Support for complaint ${report.trackingId} recorded successfully.`,
          report: updated
        };
      }
    });
    return res.json({
      alreadySupported: result.alreadySupported,
      message: result.message,
      report: formatReport(result.report)
    });
  } catch (error) {
    console.error("Support report error:", error);
    return res.status(500).json({ error: "Failed to record support for report." });
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
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const { id } = req.params;
    const report = await prisma.report.findFirst({
      where: { OR: [{ id }, { trackingId: id }] }
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    if (req.user.role === "citizen" && report.userId !== req.user.userId) {
      return res.status(403).json({ error: "You are not authorised to delete this report." });
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
  const uploadsDir = isServerless2 ? path3.join(os3.tmpdir(), "uploads") : path3.join(process.cwd(), "uploads");
  if (!fs3.existsSync(uploadsDir)) {
    fs3.mkdirSync(uploadsDir, { recursive: true });
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
