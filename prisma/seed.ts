import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INITIAL_SEED_REPORTS = [
  {
    id: 'rep-101',
    trackingId: 'CF-2026-10482',
    title: 'Large Pothole on Main Road',
    category: 'Roads & Potholes',
    location: 'MG Road, Camp Area, Pune',
    ward: 'Ward 14 - Camp Zone',
    priority: 'High',
    department: 'Roads & Infrastructure',
    assignedTo: 'Eng. Rajesh Deshmukh',
    status: 'Pending Verification',
    date: '18 Sep 2026',
    reportedAgo: '4 hours ago',
    citizenName: 'Aarav Deshmukh',
    citizenPhone: '+91 98765 43210',
    description: 'Deep pothole causing traffic slowdown near MG Road signal. Water accumulation inside.',
    lat: 18.5204,
    lng: 73.8567,
    upvotesCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rep-102',
    trackingId: 'CF-2026-10476',
    title: 'Broken Streetlight Poles',
    category: 'Street Lighting',
    location: 'Koregaon Park Lane 7, Pune',
    ward: 'Ward 08 - Koregaon Park',
    priority: 'Medium',
    department: 'Electrical',
    assignedTo: 'Electrical Team B',
    status: 'Pending Verification',
    date: '18 Sep 2026',
    reportedAgo: '6 hours ago',
    citizenName: 'Priya Nair',
    citizenPhone: '+91 98123 45678',
    description: 'Multiple streetlights unlit along Lane 7, creating safety concerns at night.',
    lat: 18.5362,
    lng: 73.8940,
    upvotesCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rep-103',
    trackingId: 'CF-2026-10465',
    title: 'Garbage Overflow near Market',
    category: 'Sanitation & Waste',
    location: 'Mandai Market, Shukrawar Peth, Pune',
    ward: 'Ward 11 - Peth Zone',
    priority: 'High',
    department: 'Sanitation',
    assignedTo: 'Sanitation Inspector Kulkarni',
    status: 'Pending Verification',
    date: '17 Sep 2026',
    reportedAgo: '1 day ago',
    citizenName: 'Sunil Joshi',
    citizenPhone: '+91 97654 32109',
    description: 'Overloaded community trash container spilling onto pedestrian walkway.',
    lat: 18.5126,
    lng: 73.8553,
    upvotesCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rep-104',
    trackingId: 'CF-2026-10451',
    title: 'Major Water Pipeline Leakage',
    category: 'Water & Drainage',
    location: 'DP Road, Aundh, Pune',
    ward: 'Ward 03 - Aundh Zone',
    priority: 'Critical',
    department: 'Water Department',
    assignedTo: 'Rapid Water Response Unit',
    status: 'Pending Verification',
    date: '16 Sep 2026',
    reportedAgo: '2 days ago',
    citizenName: 'Vikram Mehta',
    citizenPhone: '+91 99887 76655',
    description: 'High-pressure water main leaking continuously onto main DP Road road surface.',
    lat: 18.5580,
    lng: 73.8077,
    upvotesCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rep-105',
    trackingId: 'CF-2026-10440',
    title: 'Clogged Stormwater Drain',
    category: 'Water & Drainage',
    location: 'FC Road, Shivajinagar, Pune',
    ward: 'Ward 12 - Shivajinagar',
    priority: 'High',
    department: 'Public Works',
    assignedTo: 'Drainage Crew Alpha',
    status: 'Pending Verification',
    date: '19 Sep 2026',
    reportedAgo: '2 hours ago',
    citizenName: 'Neha Shinde',
    citizenPhone: '+91 96543 21098',
    description: 'Drain inlet blocked with dry leaves and silt, causing puddle overflow.',
    lat: 18.5284,
    lng: 73.8415,
    upvotesCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rep-106',
    trackingId: 'CF-2026-10432',
    title: 'Hazardous Overhead Cable',
    category: 'Public Safety',
    location: 'Viman Nagar Main Road, Pune',
    ward: 'Ward 06 - Viman Nagar',
    priority: 'Critical',
    department: 'Electrical',
    assignedTo: 'Emergency Power Wing',
    status: 'New',
    date: '20 Sep 2026',
    reportedAgo: '45 mins ago',
    citizenName: 'Anil Agarwal',
    citizenPhone: '+91 95432 10987',
    description: 'Dangling electrical/telecom wire hanging low near bus stop.',
    lat: 18.5679,
    lng: 73.9143,
    upvotesCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rep-107',
    trackingId: 'CF-2026-10425',
    title: 'Public Park Light Malfunction',
    category: 'Street Lighting',
    location: 'Chhatrapati Sambhaji Garden, JM Road, Pune',
    ward: 'Ward 12 - Shivajinagar',
    priority: 'Low',
    department: 'Electrical',
    assignedTo: 'Garden Maintenance Dept',
    status: 'Pending Verification',
    date: '19 Sep 2026',
    reportedAgo: '1 day ago',
    citizenName: 'Smita Kulkarni',
    citizenPhone: '+91 94321 09876',
    description: 'Solar park lights dimming out prematurely at 8 PM.',
    lat: 18.5215,
    lng: 73.8478,
    upvotesCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const officialUser = await prisma.user.upsert({
    where: { email: 'officer.pmc@pune.gov.in' },
    update: {},
    create: {
      email: 'officer.pmc@pune.gov.in',
      name: 'Er. Rajesh Kulkarni',
      passwordHash,
      role: 'official',
      department: 'Roads & Infrastructure',
      employeeId: 'PMC-EXEC-8842',
      phone: '+91 20 2550 1000',
      ward: 'Central PMC Zone',
      isDemo: true,
    },
  });

  const citizenUser = await prisma.user.upsert({
    where: { email: 'citizen.aarav@civicfix.org' },
    update: {},
    create: {
      email: 'citizen.aarav@civicfix.org',
      name: 'Aarav Deshmukh',
      passwordHash,
      role: 'citizen',
      phone: '+91 98765 43210',
      ward: 'Ward 12 - Shivajinagar',
      isDemo: true,
    },
  });

  console.log('✅ Demo users seeded:', { official: officialUser.email, citizen: citizenUser.email });

  // 2. Seed Initial Reports
  for (const item of INITIAL_SEED_REPORTS) {
    const report = await prisma.report.upsert({
      where: { trackingId: item.trackingId },
      update: {
        imageUrl: item.imageUrl,
      },
      create: {
        id: item.id,
        trackingId: item.trackingId,
        title: item.title,
        category: item.category,
        location: item.location,
        ward: item.ward,
        priority: item.priority,
        department: item.department,
        assignedTo: item.assignedTo,
        status: item.status,
        date: item.date,
        reportedAgo: item.reportedAgo,
        citizenName: item.citizenName,
        citizenPhone: item.citizenPhone,
        description: item.description,
        lat: item.lat,
        lng: item.lng,
        upvotesCount: item.upvotesCount,
        imageUrl: item.imageUrl,
        userId: citizenUser.id,
      },
    });

    // Check if timeline events exist
    const timelineCount = await prisma.timelineEvent.count({
      where: { reportId: report.id },
    });

    if (timelineCount === 0) {
      await prisma.timelineEvent.createMany({
        data: [
          { reportId: report.id, step: 'Report Submitted', date: item.date, completed: true, order: 1 },
          { reportId: report.id, step: 'Issue Verification', date: 'Pending', completed: false, current: true, order: 2 },
          { reportId: report.id, step: 'Team Assignment', date: 'Pending', completed: false, order: 3 },
          { reportId: report.id, step: 'Issue Resolved', date: 'Pending', completed: false, order: 4 },
        ],
      });
    }
  }

  console.log(`✅ ${INITIAL_SEED_REPORTS.length} civic reports seeded into database.`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
