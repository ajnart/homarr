import { PrismaClient } from '@prisma/client';
import { env } from '~/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NEXT_PUBLIC_NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NEXT_PUBLIC_NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
