# PostgreSQL Database Setup Guide

## Why PostgreSQL?

PostgreSQL is the **best choice** for this ticket system because:
- ✅ **ACID Compliance** - Ensures data integrity during concurrent entry checks
- ✅ **Reliability** - Critical for preventing double-entry or lost tickets
- ✅ **Performance** - Fast queries even with thousands of tickets
- ✅ **Scalability** - Handles high traffic during event entry
- ✅ **Next.js Integration** - Excellent support with Prisma ORM

## Setup Options

### Option 1: Local PostgreSQL (Development)

1. **Install PostgreSQL:**
   - **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **Mac:** `brew install postgresql@14`
   - **Linux:** `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database:**
   ```bash
   # Start PostgreSQL service
   # Windows: Start service from Services
   # Mac/Linux: brew services start postgresql@14

   # Create database
   createdb luxe_legacy
   ```

3. **Update `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/luxe_legacy?schema=public"
   ```

### Option 2: Cloud PostgreSQL (Production Recommended)

#### **A. Vercel Postgres (Easiest for Vercel deployments)**
1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Select "Postgres"
3. Copy the connection string to `.env`

#### **B. Supabase (Free tier available)**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

#### **C. Railway (Simple & Fast)**
1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from the Variables tab

#### **D. Neon (Serverless PostgreSQL)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy the connection string from the dashboard

#### **E. AWS RDS / Google Cloud SQL (Enterprise)**
- For large-scale production deployments
- More complex setup, better for enterprise needs

## Installation Steps

### 1. Install Dependencies (Already done)
```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Configure Database URL

Create or update `.env` file in project root:
```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Database Migrations
```bash
# Create and apply migrations
npx prisma migrate dev --name init

# This will:
# - Create the tickets table
# - Set up indexes
# - Generate Prisma Client
```

### 5. (Optional) View Database with Prisma Studio
```bash
npx prisma studio
```
Opens a GUI to view and manage your database.

## Production Deployment

### For Vercel:
1. Add `DATABASE_URL` to Vercel Environment Variables
2. Run migrations before deployment:
   ```bash
   npx prisma migrate deploy
   ```
3. Or add to `package.json` scripts:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate",
       "vercel-build": "prisma migrate deploy && next build"
     }
   }
   ```

### For Other Platforms:
- Add `DATABASE_URL` as environment variable
- Run `npx prisma migrate deploy` after deployment
- Ensure Prisma Client is generated: `npx prisma generate`

## Database Schema

The `Ticket` model includes:
- `uniqueTicketId` - Unique identifier for QR code scanning
- `bookingId` - Booking reference
- `ticketTypeId` - Type of ticket purchased
- `ticketTypeName` - Human-readable ticket name
- `maxEntries` - Maximum allowed entries (1, 2, or 3)
- `usedEntries` - Number of entries already used
- `isValid` - Whether ticket is still valid
- `createdAt` / `updatedAt` - Timestamps

## Testing the Setup

1. **Test connection:**
   ```bash
   npx prisma db pull
   ```

2. **Create a test ticket via API:**
   ```bash
   curl -X POST http://localhost:3000/api/tickets/create \
     -H "Content-Type: application/json" \
     -d '{
       "uniqueTicketId": "TKT-TEST-123",
       "bookingId": "LL-TEST-123",
       "ticketTypeId": "only-entry-1",
       "ticketTypeName": "Only Entry (1 Person)",
       "maxEntries": 1
     }'
   ```

3. **Verify ticket:**
   ```bash
   curl http://localhost:3000/api/tickets/TKT-TEST-123
   ```

## Troubleshooting

### Connection Issues:
- Check PostgreSQL is running: `pg_isready`
- Verify connection string format
- Check firewall/network settings

### Migration Issues:
- Reset database: `npx prisma migrate reset` (⚠️ deletes all data)
- Check Prisma schema syntax

### Performance:
- Indexes are automatically created on `uniqueTicketId` and `bookingId`
- For high traffic, consider connection pooling (Prisma Data Proxy)

## Next Steps

✅ Database is now ready!
✅ All API routes use PostgreSQL
✅ Transactions ensure data integrity
✅ Ready for production deployment

