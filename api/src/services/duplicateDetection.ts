import { prisma } from '../db';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  duplicateCount: number;
  existingReport?: {
    id: string;
    trackingId: string;
    title: string;
    category: string;
    location: string;
    status: string;
    distanceMeters: number;
  };
}

// Calculate Haversine distance in meters between two lat/lng points
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function checkDuplicateCivicReport(
  category: string,
  lat: number,
  lng: number,
  title?: string,
  radiusMeters: number = 100
): Promise<DuplicateCheckResult> {
  // Find open reports in the same or related category
  const activeReports = await prisma.report.findMany({
    where: {
      status: {
        in: ['New', 'Pending Verification', 'Verified', 'Assigned', 'In Progress'],
      },
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
    },
  });

  for (const report of activeReports) {
    const dist = calculateDistanceMeters(lat, lng, report.lat, report.lng);

    // If within radius and same category
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
          distanceMeters: Math.round(dist),
        },
      };
    }
  }

  return {
    isDuplicate: false,
    confidence: 0,
    duplicateCount: 0,
  };
}
