import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database configuration...');

  // 1. Seed Demo Authority & Citizen Users (Zero mock complaints)
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

  console.log('✅ Demo accounts seeded (Official & Citizen):', {
    official: officialUser.email,
    citizen: citizenUser.email,
  });

  // Verify zero complaints exist
  const count = await prisma.report.count();
  console.log(`✅ Reports in database: ${count} (Zero artificial reports seeded)`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
