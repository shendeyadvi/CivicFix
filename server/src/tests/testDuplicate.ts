import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../db';
import { findPotentialDuplicates, calculateDistanceMeters, computeTextSimilarity } from '../services/duplicateDetection';

async function testDuplicateLogic() {
  console.log('=== CIVICFIX DUPLICATE DETECTION VERIFICATION ===\n');

  // Test 1: Haversine distance calculation
  const d1 = calculateDistanceMeters(18.5204, 73.8567, 18.52048, 73.85678);
  console.log(`[TEST 1] Distance for ~8m offset: ${Math.round(d1)} meters (Expected: ~8-12m)`);

  const d2 = calculateDistanceMeters(18.5204, 73.8567, 18.5304, 73.8667);
  console.log(`[TEST 2] Distance for far point: ${Math.round(d2)} meters (Expected: >1000m)`);

  // Test 2: Semantic text similarity
  const sim1 = computeTextSimilarity(
    'Deep dangerous pothole damaging two wheelers',
    'Severe road crater and pothole near signal'
  );
  console.log(`[TEST 3] Text similarity for same defect (pothole): ${(sim1 * 100).toFixed(1)}% (Expected: > 50%)`);

  const sim2 = computeTextSimilarity(
    'Deep dangerous pothole damaging two wheelers',
    'Dark broken streetlight pole not working'
  );
  console.log(`[TEST 4] Text similarity for different defect (pothole vs streetlight): ${(sim2 * 100).toFixed(1)}% (Expected: < 20%)`);

  // Test 3: Query active reports from database
  console.log('\n[TEST 5] Checking active database reports for duplicate detection...');
  const count = await prisma.report.count();
  console.log(`Current reports in database: ${count}`);

  const sampleReport = await prisma.report.findFirst({
    where: { status: { in: ['New', 'Pending Verification', 'Verified', 'In Progress'] } }
  });

  if (sampleReport) {
    console.log(`Found active report for duplicate test: [${sampleReport.trackingId}] "${sampleReport.title}" in ${sampleReport.category} at (${sampleReport.lat}, ${sampleReport.lng})`);

    // A: Test exact same location & category -> MUST detect duplicate
    const dupResult = await findPotentialDuplicates({
      category: sampleReport.category,
      lat: sampleReport.lat + 0.00005, // ~5 meters away
      lng: sampleReport.lng + 0.00005,
      title: sampleReport.title,
      description: sampleReport.description,
    });

    console.log(`\nDuplicate test A (Same location ~7m away, same defect):`);
    console.log(`  -> isDuplicate: ${dupResult.isDuplicate}`);
    console.log(`  -> confidence: ${(dupResult.confidence * 100).toFixed(1)}%`);
    console.log(`  -> matched trackingId: ${dupResult.existingReport?.trackingId}`);
    console.log(`  -> distance: ${dupResult.existingReport?.distanceMeters}m`);
    console.log(`  -> reason: ${dupResult.matchReason}`);

    // B: Test same category but far away (>500m) -> MUST NOT detect duplicate
    const farResult = await findPotentialDuplicates({
      category: sampleReport.category,
      lat: sampleReport.lat + 0.05, // ~5.5 km away
      lng: sampleReport.lng + 0.05,
      title: sampleReport.title,
      description: sampleReport.description,
    });

    console.log(`\nDuplicate test B (Same category, 5km away):`);
    console.log(`  -> isDuplicate: ${farResult.isDuplicate} (Expected: false)`);

    // C: Test same location but completely different category -> MUST NOT detect duplicate
    const diffCatResult = await findPotentialDuplicates({
      category: sampleReport.category.includes('Road') ? 'Electrical & Lighting' : 'Roads & Infrastructure',
      lat: sampleReport.lat,
      lng: sampleReport.lng,
      title: 'Completely different civic issue',
      description: 'Different issue at same intersection',
    });

    console.log(`\nDuplicate test C (Same location, completely different category):`);
    console.log(`  -> isDuplicate: ${diffCatResult.isDuplicate} (Expected: false)`);
  } else {
    console.log('No active reports currently in DB to test against.');
  }

  await prisma.$disconnect();
  console.log('\n=== DUPLICATE DETECTION TEST COMPLETED ===');
}

testDuplicateLogic().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
