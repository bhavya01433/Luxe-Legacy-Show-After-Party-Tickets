# Testing Guide: Complete Ticket Flow

## Free Test Ticket Setup

A free test ticket has been added to allow testing the complete flow without payment processing.

### Test Ticket Details
- **ID:** `free-test-entry`
- **Name:** "Free Test Entry (1 Person) - Testing Only"
- **Price:** ₹0 (Free)
- **Entries:** 1 person

## Complete Testing Flow

### Step 1: Create a Test Ticket

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the site:**
   - Open `http://localhost:3000`
   - You'll see the "Free Test Entry" ticket as the first option

3. **Click "Proceed with UPI"** on the free test ticket

4. **Fill in user information:**
   - Full Name: Your test name
   - WhatsApp Number: Your WhatsApp number (format: +91XXXXXXXXXX or 91XXXXXXXXXX)
   - Email: Your email address

5. **Click "Continue"**
   - For free tickets, payment step is skipped
   - Click "Confirm Booking"

6. **Ticket Created:**
   - You'll see a confirmation screen
   - Status shows "Pending Approval"
   - Note your Ticket ID

### Step 2: Admin Approval

1. **View pending tickets:**
   ```bash
   curl http://localhost:3000/api/admin/tickets/pending
   ```
   Or use Postman/Thunder Client

2. **Approve the ticket:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/tickets/{TICKET_ID}/approve \
     -H "Content-Type: application/json" \
     -d '{"approvedBy": "admin"}'
   ```
   Replace `{TICKET_ID}` with your actual ticket ID

3. **What happens:**
   - QR code is generated
   - WhatsApp message is sent (if Twilio is configured)
   - Ticket status updated to "Approved"

### Step 3: Verify WhatsApp Delivery

1. **Check your WhatsApp:**
   - You should receive a message with:
     - Event details
     - Ticket information
     - QR code image attachment

2. **If WhatsApp not configured:**
   - Check the API response for `qrCodeUrl`
   - QR code is saved to `/public/qr-codes/{ticketId}.png`
   - You can view it at: `http://localhost:3000/qr-codes/{ticketId}.png`

### Step 4: Test Entry Verification

1. **Get the verification URL:**
   - Format: `http://localhost:3000/verify/{TICKET_ID}`

2. **Open the verification page:**
   - Should show "ENTRY ALLOWED" (green screen)
   - Shows ticket details and remaining entries

3. **Test entry marking:**
   - Click "MARK ENTRY"
   - Entry count should decrement
   - Refresh to see updated count

## API Testing

### Create Ticket (Free)
```bash
curl -X POST http://localhost:3000/api/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueTicketId": "TKT-TEST-001",
    "bookingId": "LL-TEST-001",
    "ticketTypeId": "free-test-entry",
    "ticketTypeName": "Free Test Entry (1 Person) - Testing Only",
    "maxEntries": 1,
    "userName": "Test User",
    "whatsappNumber": "+919876543210",
    "email": "test@example.com"
  }'
```

### View Pending Tickets
```bash
curl http://localhost:3000/api/admin/tickets/pending
```

### Approve Ticket
```bash
curl -X POST http://localhost:3000/api/admin/tickets/TKT-TEST-001/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "admin"}'
```

### View Approved Tickets
```bash
curl http://localhost:3000/api/admin/tickets/approved
```

## WhatsApp Setup (Optional for Testing)

If you want to test WhatsApp delivery:

1. **Sign up for Twilio:**
   - Go to [twilio.com](https://www.twilio.com)
   - Create a free account
   - Get Account SID and Auth Token

2. **Set up WhatsApp Sandbox:**
   - In Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join sandbox
   - Get your WhatsApp number

3. **Add to `.env`:**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

4. **Test WhatsApp:**
   - Approve a ticket
   - Check your WhatsApp for the message

## Database Verification

### View Tickets in Database

1. **Open Prisma Studio:**
   ```bash
   npm run db:studio
   ```

2. **Navigate to Tickets table:**
   - See all tickets
   - Check approval status
   - Verify user information
   - Check QR code sent status

### Check QR Code Files

QR codes are saved to:
```
/public/qr-codes/{ticketId}.png
```

Access via:
```
http://localhost:3000/qr-codes/{ticketId}.png
```

## Troubleshooting

### Ticket Not Created
- Check browser console for errors
- Verify API response in Network tab
- Check server logs

### Approval Not Working
- Verify ticket ID is correct
- Check database connection
- Review API response for errors

### WhatsApp Not Sending
- Check Twilio credentials in `.env`
- Verify WhatsApp number format
- Check Twilio account balance
- Review server logs for Twilio errors

### QR Code Not Generating
- Check file permissions for `/public/qr-codes`
- Verify base URL is set correctly
- Check server logs

## Next Steps After Testing

Once you've verified the flow works:

1. **Remove free ticket** (when ready for production)
2. **Set up merchant UPI** for real payments
3. **Configure production WhatsApp** (Twilio Business Account)
4. **Add admin authentication** to protect admin endpoints
5. **Set up monitoring** for failed WhatsApp deliveries

## Production Checklist

- [ ] Remove free test ticket from config
- [ ] Set up merchant UPI ID
- [ ] Configure production WhatsApp
- [ ] Add admin authentication
- [ ] Set up error monitoring
- [ ] Configure cron jobs for automated processing
- [ ] Test with real payment flow
- [ ] Set up database backups

