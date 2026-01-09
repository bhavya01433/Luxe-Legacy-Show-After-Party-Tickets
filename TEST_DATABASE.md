# Testing Your Database Setup

## ✅ Setup Complete!

Your database is now configured and ready to use. Here's how to verify everything works:

## 1. View Database Entries with Prisma Studio

Open Prisma Studio (visual database browser):

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tickets
- See ticket details
- Monitor entry counts
- Check ticket validity

## 2. Test the API

### Create a Test Ticket

1. **Complete a payment flow** on your site, OR
2. **Use the API directly:**

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

### Verify Ticket

```bash
curl http://localhost:3000/api/tickets/TKT-TEST-123
```

### Mark Entry

```bash
curl -X POST http://localhost:3000/api/tickets/TKT-TEST-123
```

## 3. Check Database Directly

You can also query the database using Prisma Studio or any PostgreSQL client.

## 4. Monitor in Real-Time

- **During Event:** Use Prisma Studio to monitor entries in real-time
- **Check Remaining Entries:** Query shows `remainingEntries` for each ticket
- **Track Usage:** See `usedEntries` vs `maxEntries`

## Next Steps

1. ✅ Database is set up
2. ✅ Schema is synced
3. ✅ API routes are ready
4. 🎯 **Test with real payment flow**
5. 🎯 **Monitor entries during event**

Your ticket system is production-ready! 🎉

