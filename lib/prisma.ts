import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 Configuration with Accelerate
// Check if DATABASE_URL is a Prisma Accelerate URL (starts with "prisma+postgres")
const databaseUrl = process.env.DATABASE_URL || "";
const isAccelerateUrl = databaseUrl.startsWith("prisma+postgres://");
const accelerateUrl = isAccelerateUrl ? databaseUrl : process.env.PRISMA_ACCELERATE_URL;

if (!accelerateUrl && !databaseUrl) {
  throw new Error(
    "DATABASE_URL or PRISMA_ACCELERATE_URL must be set. Please configure your database connection."
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Use Accelerate URL if available (required for Prisma 7)
    ...(accelerateUrl ? { accelerateUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

