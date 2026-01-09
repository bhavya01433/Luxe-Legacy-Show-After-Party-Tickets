import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 Configuration with Accelerate
// Check if DATABASE_URL is a Prisma Accelerate URL (starts with "prisma+postgres")
const databaseUrl = process.env.DATABASE_URL || "";
const isAccelerateUrl = databaseUrl.startsWith("prisma+postgres://");
const accelerateUrl = isAccelerateUrl ? databaseUrl : process.env.PRISMA_ACCELERATE_URL;

// Don't throw errors during build - only warn
// Prisma will handle connection errors at runtime
if (!accelerateUrl && !databaseUrl) {
  // Only warn, don't throw - allows build to complete
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️  DATABASE_URL or PRISMA_ACCELERATE_URL is not set. Database operations will fail at runtime."
    );
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Use Accelerate URL if available (required for Prisma 7)
    // If not available, Prisma will throw a helpful error at runtime when used
    ...(accelerateUrl ? { accelerateUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

