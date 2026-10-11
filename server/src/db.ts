import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let _prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (_prismaInstance) return _prismaInstance;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  try {
    _prismaInstance = new PrismaClient({
      log: ['error', 'warn'],
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prismaInstance;
    }
    return _prismaInstance;
  } catch (err) {
    console.error('Failed to initialize Prisma client:', err);
    throw err;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

