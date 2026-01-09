# Prisma 7 Database Setup

## ⚠️ Important: Prisma 7 Requirements

Prisma 7 requires either:
1. **Prisma Accelerate** (recommended for serverless)
2. **Database Adapter** (for direct connections)

## Quick Setup Options

### Option 1: Use Prisma Accelerate (Easiest)

1. **Sign up at [Prisma Accelerate](https://pris.ly/accelerate)**
2. **Get your Accelerate URL**
3. **Add to `.env`:**
   ```env
   PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_KEY"
   ```

4. **Update `lib/prisma.ts`** to use Accelerate:
   ```typescript
   export const prisma = new PrismaClient({
     accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
   });
   ```

### Option 2: Use Prisma 6 (Standard Approach)

If you prefer the standard Prisma setup:

```bash
npm install prisma@^6.0.0 @prisma/client@^6.0.0
```

Then use standard PrismaClient initialization (no adapter needed).

### Option 3: Wait for Prisma 7 Stable Adapter

Prisma 7 adapters are still in development. For production, consider:
- Using Prisma Accelerate
- Using Prisma 6 for now
- Using a different ORM (Drizzle, TypeORM)

## Current Status

The code is set up for PostgreSQL but requires Prisma 7 adapter configuration.

**For immediate use:** Consider downgrading to Prisma 6 or using Prisma Accelerate.

