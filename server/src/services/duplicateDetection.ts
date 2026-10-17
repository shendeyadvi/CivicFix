import path from 'path';
import fs from 'fs';
import os from 'os';
import { prisma } from '../db';
import { compareCivicImagesWithGemini } from './geminiVision';

export interface DuplicateCheckOptions {
  category: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
  radiusMeters?: number;
  excludeReportId?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  duplicateCount: number;
  isCertainMatch: boolean;
  matchReason?: string;
  existingReport?: {
    id: string;
    trackingId: string;
    title: string;
    category: string;
    location: string;
    status: string;
    distanceMeters: number;
    upvotes: number;
    imageUrl?: string;
    date?: string;
    reportedAgo?: string;
    description?: string;
  };
}

// Configurable geographic proximity threshold (Default: 45 meters, within 30-50m guideline)
export const DEFAULT_DUPLICATE_RADIUS_METERS = process.env.DUPLICATE_RADIUS_METERS
  ? parseFloat(process.env.DUPLICATE_RADIUS_METERS)
  : 45;

// Common stop words to exclude during text similarity comparison
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'it', 'this', 'that', 'from', 'near', 'pune', 'civic',
  'fix', 'pmc', 'area', 'road', 'street', 'lane', 'issue', 'problem', 'report',
  'complaint', 'reported', 'detected', 'analysis', 'immediate', 'please', 'requiring',
]);

// Specific civic defect keywords to establish semantic defect-type matching
const DEFECT_KEYWORDS = new Set([
  // Roads
  'pothole', 'potholes', 'crater', 'asphalt', 'cavity', 'tarmac', 'sinkhole', 'divider', 'footpath', 'sidewalk',
  // Lighting
  'streetlight', 'light', 'pole', 'lamp', 'luminaire', 'illumination', 'bulb', 'dark', 'lighting',
  // Sanitation
  'garbage', 'waste', 'trash', 'dump', 'overflow', 'debris', 'bin', 'litter', 'sanitation', 'spilling',
  // Drainage & Water
  'water', 'leak', 'leakage', 'pipe', 'pipeline', 'drain', 'drainage', 'manhole', 'sewage', 'flooding', 'burst', 'waterlogging',
  // Safety
  'wire', 'wires', 'cable', 'transformer', 'hazard', 'safety', 'danger',
]);

// Calculate Haversine distance in meters between two lat/lng points
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Tokenize text into non-stop-word stems
function tokenize(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(clean);
}

// Calculate lexical and defect keyword similarity between two text descriptions
export function computeTextSimilarity(text1: string, text2: string): number {
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

  // Compare core defect keywords (e.g. 'pothole', 'garbage', 'streetlight', 'drain')
  const defects1 = [...tokens1].filter((w) => DEFECT_KEYWORDS.has(w));
  const defects2 = [...tokens2].filter((w) => DEFECT_KEYWORDS.has(w));

  let defectMatch = 0;
  if (defects1.length > 0 && defects2.length > 0) {
    const commonDefects = defects1.filter((d) => defects2.includes(d));
    defectMatch = commonDefects.length / Math.max(defects1.length, defects2.length);
  }

  // Defect keyword match carries significant weight for distinguishing distinct defects
  return Math.min(1, jaccard * 0.4 + defectMatch * 0.6);
}

// Retrieve image buffer from disk, base64 data, or remote URL
async function getImageBuffer(
  imageUrl?: string | null,
  directBuffer?: Buffer,
  directMime?: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (directBuffer && directBuffer.length > 0) {
    return { buffer: directBuffer, mimeType: directMime || 'image/jpeg' };
  }

  if (!imageUrl) return null;

  try {
    // 1. Data URL
    if (imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return {
          mimeType: matches[1],
          buffer: Buffer.from(matches[2], 'base64'),
        };
      }
    }

    // 2. Local uploads folder
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
      const fileName = path.basename(imageUrl);
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const uploadDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(fileName).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return {
          buffer: fs.readFileSync(filePath),
          mimeType,
        };
      }
    }

    // 3. Remote HTTP/HTTPS URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout
      const res = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const mimeType = res.headers.get('content-type') || 'image/jpeg';
        return {
          buffer: Buffer.from(arrayBuf),
          mimeType,
        };
      }
    }
  } catch (err) {
    console.warn('[DuplicateDetection] Failed to fetch report image:', err);
  }

  return null;
}

/**
 * Robust civic report duplicate detection.
 * Compares:
 * 1. Geographic proximity using latitude and longitude (configurable threshold 30-50m).
 * 2. Category matching (never used alone as proof of duplication).
 * 3. AI-generated issue title and description semantic similarity.
 * 4. Image comparison using Gemini Vision (when both images are available).
 * 5. Report active status.
 */
export async function checkDuplicateCivicReport(
  categoryOrOptions: string | DuplicateCheckOptions,
  lat?: number,
  lng?: number,
  title?: string,
  radiusMeters?: number
): Promise<DuplicateCheckResult> {
  let opts: DuplicateCheckOptions;

  if (typeof categoryOrOptions === 'object') {
    opts = categoryOrOptions;
  } else {
    opts = {
      category: categoryOrOptions,
      lat: lat ?? 0,
      lng: lng ?? 0,
      title: title || '',
      radiusMeters: radiusMeters ?? DEFAULT_DUPLICATE_RADIUS_METERS,
    };
  }

  const effectiveRadius = opts.radiusMeters || DEFAULT_DUPLICATE_RADIUS_METERS;
  const targetCategory = (opts.category || '').trim().toLowerCase();
  const targetText = `${opts.title || ''} ${opts.description || ''}`.trim();

  // Validate coordinates
  if (isNaN(opts.lat) || isNaN(opts.lng) || opts.lat === 0 || opts.lng === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      duplicateCount: 0,
      isCertainMatch: false,
    };
  }

  // 1. Fetch only active, unresolved reports in the database
  const activeReports = await prisma.report.findMany({
    where: {
      status: {
        in: ['New', 'Pending Verification', 'Verified', 'Assigned', 'In Progress', 'Overdue'],
      },
      ...(opts.excludeReportId ? { id: { not: opts.excludeReportId } } : {}),
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
      reportedAgo: true,
    },
  });

  if (activeReports.length === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      duplicateCount: 0,
      isCertainMatch: false,
    };
  }

  interface CandidateEvaluation {
    report: (typeof activeReports)[0];
    distanceMeters: number;
    proximityScore: number;
    textSimilarity: number;
    visualComparison: { isSameDefect: boolean; confidence: number; reason: string } | null;
    overallConfidence: number;
    isCertain: boolean;
    reason: string;
  }

  const candidates: CandidateEvaluation[] = [];

  // Prepare input image buffer if provided
  let newImageInfo: { buffer: Buffer; mimeType: string } | null = null;
  if (opts.imageBuffer || opts.imageUrl) {
    newImageInfo = await getImageBuffer(opts.imageUrl, opts.imageBuffer, opts.imageMimeType);
  }

  for (const report of activeReports) {
    const dist = calculateDistanceMeters(opts.lat, opts.lng, report.lat, report.lng);

    // Filter strictly by geographic proximity threshold (30-50m)
    // Distant complaints of the same category are NOT duplicates
    if (dist > effectiveRadius) {
      continue;
    }

    // Require matching civic domain/category
    const reportCategory = report.category.trim().toLowerCase();
    const categoriesMatch =
      reportCategory === targetCategory ||
      (reportCategory.includes('road') && targetCategory.includes('road')) ||
      (reportCategory.includes('light') && targetCategory.includes('light')) ||
      (reportCategory.includes('waste') && targetCategory.includes('waste')) ||
      (reportCategory.includes('water') && targetCategory.includes('water'));

    if (!categoriesMatch) {
      continue;
    }

    // Compute proximity score (1.0 at 0m, 0.0 at effectiveRadius)
    const proximityScore = Math.max(0, 1 - dist / effectiveRadius);

    // Compute text and defect keyword similarity
    const reportText = `${report.title} ${report.description}`.trim();
    const textSimilarity = computeTextSimilarity(targetText, reportText);

    // Compare images if both reports provide photographic evidence
    let visualComparison: { isSameDefect: boolean; confidence: number; reason: string } | null = null;
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
          console.warn('[DuplicateDetection] Visual comparison error:', err);
        }
      }
    }

    let overallConfidence = 0;
    let isCertain = false;
    let reason = '';

    if (visualComparison !== null) {
      if (visualComparison.isSameDefect) {
        // High confidence match confirmed by visual analysis
        overallConfidence = Math.min(
          1,
          0.3 * proximityScore + 0.25 * textSimilarity + 0.45 * visualComparison.confidence
        );
        isCertain = visualComparison.confidence >= 0.75;
        reason = `Identified matching physical defect ${Math.round(dist)}m away. ${visualComparison.reason}`;
      } else {
        // Visual comparison indicates they are different physical defects
        overallConfidence = Math.max(0, 0.25 * proximityScore + 0.15 * textSimilarity);
        isCertain = false;
        reason = `Located nearby (${Math.round(dist)}m), but visual analysis indicates separate defects: ${visualComparison.reason}`;
      }
    } else {
      // Image similarity cannot be reliably determined: treat as potential duplicate rather than claiming certainty
      overallConfidence = Math.min(1, 0.55 * proximityScore + 0.45 * textSimilarity);
      isCertain = false;
      reason = `Potential duplicate within ${Math.round(dist)}m in ${report.category}. Visual comparison could not be definitively confirmed.`;
    }

    // A report must meet minimum credibility to be treated as a candidate duplicate
    // (Proximity <= threshold AND matching category AND either defect keyword match or proximity < 25m)
    if (overallConfidence >= 0.40 || (proximityScore >= 0.6 && textSimilarity >= 0.2)) {
      candidates.push({
        report,
        distanceMeters: Math.round(dist),
        proximityScore,
        textSimilarity,
        visualComparison,
        overallConfidence: Math.round(overallConfidence * 100) / 100,
        isCertain,
        reason,
      });
    }
  }

  if (candidates.length === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      duplicateCount: 0,
      isCertainMatch: false,
    };
  }

  // Sort candidates by highest overall confidence
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
      imageUrl: bestMatch.report.imageUrl || undefined,
      date: bestMatch.report.date,
      reportedAgo: bestMatch.report.reportedAgo,
      description: bestMatch.report.description,
    },
  };
}

export const findPotentialDuplicates = checkDuplicateCivicReport;
