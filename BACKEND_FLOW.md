# Backend Flow Documentation

## Complete Ticket Approval & WhatsApp Delivery System

### Overview

This system handles the complete flow from ticket purchase to QR code delivery via WhatsApp, with admin approval as a security checkpoint.

## Flow Diagram

```
1. User Purchases Ticket
   ↓
2. User Provides Info (Name, WhatsApp, Email)
   ↓
3. Ticket Created (Status: Pending Approval)
   ↓
4. Admin Approves Ticket
   ↓
5. QR Code Generated
   ↓
6. WhatsApp Message Sent with QR Code
   ↓
7. User Receives QR Code on WhatsApp
   ↓
8. User Presents QR at Venue
```

## Database Schema

### Ticket Model
- `uniqueTicketId` - Unique identifier for QR code
- `userName` - User's full name
- `whatsappNumber` - WhatsApp number for delivery
- `email` - Email address
- `isApproved` - Approval status (default: false)
- `qrCodeSent` - Whether QR code was sent (default: false)
- `qrCodeSentAt` - Timestamp when QR code was sent
- `approvedAt` - Timestamp when approved
- `approvedBy` - Admin user who approved

## API Endpoints

### 1. Create Ticket (POST /api/tickets/create)
**Requires:** User information (name, WhatsApp, email)
**Returns:** Ticket ID, status: pending approval

### 2. Get Pending Tickets (GET /api/admin/tickets/pending)
**Returns:** List of tickets awaiting approval

### 3. Approve Ticket (POST /api/admin/tickets/[ticketId]/approve)
**Action:**
- Marks ticket as approved
- Generates QR code
- Sends WhatsApp message with QR code
- Updates ticket status

### 4. Get Approved Tickets (GET /api/admin/tickets/approved)
**Returns:** List of approved tickets

### 5. Batch Process (POST /api/admin/tickets/process-approved)
**Action:** Processes multiple approved tickets at once

### 6. Cron Job (POST /api/cron/process-tickets)
**Action:** Automated processing of approved tickets
**Security:** Protected with CRON_SECRET

## WhatsApp Integration

### Setup Required

1. **Twilio Account:**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Get Account SID and Auth Token
   - Set up WhatsApp Sandbox or Business Account

2. **Environment Variables:**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

3. **WhatsApp Message Format:**
   - Professional greeting with user's name
   - Event details (name, date)
   - Ticket type and entry count
   - QR code image attachment
   - Entry instructions

## QR Code Generation

### Process
1. Generate verification URL: `/verify/{ticketId}`
2. Create QR code image (PNG, 500x500px)
3. Save to `/public/qr-codes/{ticketId}.png`
4. Attach to WhatsApp message

### Security
- QR codes are single-use or count-based
- Validation happens server-side
- QR codes only generated after approval

## Admin Approval Workflow

### Manual Approval
1. Admin views pending tickets: `GET /api/admin/tickets/pending`
2. Admin approves ticket: `POST /api/admin/tickets/[ticketId]/approve`
3. System automatically:
   - Generates QR code
   - Sends WhatsApp message
   - Updates ticket status

### Automated Processing
- Cron job runs periodically
- Processes all approved tickets that haven't received QR codes
- Retries failed WhatsApp deliveries

## Security Features

1. **Backend Validation:**
   - All validation happens server-side
   - No sensitive data exposed to client
   - QR codes only generated after approval

2. **Single-Use/Count-Based:**
   - Tickets track `usedEntries` vs `maxEntries`
   - Auto-lock when fully used
   - Server-side entry validation

3. **Admin Protection:**
   - Admin endpoints should have authentication
   - Cron jobs protected with secrets
   - Audit trail (approvedBy, approvedAt)

## Environment Variables

```env
# Database
DATABASE_URL="prisma+postgres://..."

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
CRON_SECRET=your_cron_secret
```

## Testing

### 1. Create Test Ticket
```bash
curl -X POST http://localhost:3000/api/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueTicketId": "TKT-TEST-001",
    "bookingId": "LL-TEST-001",
    "ticketTypeId": "only-entry-1",
    "ticketTypeName": "Only Entry (1 Person)",
    "maxEntries": 1,
    "userName": "John Doe",
    "whatsappNumber": "+919876543210",
    "email": "john@example.com"
  }'
```

### 2. Approve Ticket
```bash
curl -X POST http://localhost:3000/api/admin/tickets/TKT-TEST-001/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "admin"}'
```

### 3. Check Status
```bash
curl http://localhost:3000/api/admin/tickets/approved
```

## Production Deployment

### Vercel Cron Setup
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-tickets",
    "schedule": "*/15 * * * *"
  }]
}
```

### Security Checklist
- [ ] Add authentication to admin endpoints
- [ ] Set CRON_SECRET environment variable
- [ ] Configure Twilio WhatsApp Business Account
- [ ] Set up error monitoring
- [ ] Configure retry logic for failed WhatsApp sends
- [ ] Set up database backups

## Troubleshooting

### WhatsApp Not Sending
- Check Twilio credentials
- Verify WhatsApp number format
- Check Twilio account balance
- Review Twilio logs

### QR Codes Not Generating
- Check file permissions for `/public/qr-codes`
- Verify base URL configuration
- Check server logs for errors

### Tickets Not Appearing
- Verify database connection
- Check ticket creation API response
- Review Prisma logs

