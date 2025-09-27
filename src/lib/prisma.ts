import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with fallback to Supabase client if DATABASE_URL is not available
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || undefined,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma