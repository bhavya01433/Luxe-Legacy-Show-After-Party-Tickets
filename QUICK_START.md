# Quick Start: PostgreSQL Setup

## ⚠️ Prisma 7 Note

Prisma 7 requires either **Prisma Accelerate** or a database adapter. See `PRISMA_7_SETUP.md` for details.

**Quick Fix:** Use Prisma Accelerate (easiest) or downgrade to Prisma 6.

## ✅ What's Already Done

1. ✅ Prisma installed (`@prisma/client` and `prisma`)
2. ✅ Database schema created (`prisma/schema.prisma`)
3. ✅ Prisma Client generated
4. ✅ API routes updated to use PostgreSQL
5. ✅ Prisma config file created (`prisma.config.ts`)

## 🚀 Next Steps (Choose One)

### Option A: Local PostgreSQL (Development)

1. **Install PostgreSQL:**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database:**
   ```bash
   createdb luxe_legacy
   ```

3. **Set DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/luxe_legacy?schema=public"
   ```

4. **Run Migration:**
   ```bash
   npm run db:migrate
   ```

### Option B: Cloud PostgreSQL (Recommended for Production)

#### **Vercel Postgres** (Easiest)
1. Vercel Dashboard → Your Project → Storage → Create Database → Postgres
2. Copy connection string to `.env` as `DATABASE_URL`
3. Run: `npm run db:migrate`

#### **Supabase** (Free tier)
1. Sign up at [supabase.com](https://supabase.com)
2. Create project → Settings → Database
3. Copy connection string to `.env`
4. Run: `npm run db:migrate`

#### **Neon** (Serverless)
1. Sign up at [neon.tech](https://neon.tech)
2. Create project → Copy connection string
3. Add to `.env` as `DATABASE_URL`
4. Run: `npm run db:migrate`

## 📝 Available Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Open database GUI
npm run db:studio

# Push schema changes (dev only)
npm run db:push
```

## ✅ Verify Setup

1. **Test connection:**
   ```bash
   npm run db:studio
   ```
   Should open Prisma Studio in browser

2. **Test API:**
   - Complete a payment flow
   - Ticket should be saved to database
   - Check in Prisma Studio or via API

## 📚 Full Documentation

See `DATABASE_SETUP.md` for detailed instructions.

