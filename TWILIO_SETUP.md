# Twilio WhatsApp Sandbox Setup Guide

## Quick Setup for Testing

### Step 1: Create Twilio Account

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Verify your email and phone number
3. Get your Account SID and Auth Token from the dashboard

### Step 2: Set Up WhatsApp Sandbox

1. **Go to Twilio Console:**
   - Navigate to: Messaging → Try it out → Send a WhatsApp message
   - Or go to: [Console → Messaging → Try it out](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)

2. **Join the Sandbox:**
   - You'll see a code like: `join <code>`
   - Send this code to the Twilio WhatsApp number: `+1 415 523 8886`
   - Example: Send `join example-code` to `+1 415 523 8886`

3. **Get Your Sandbox Number:**
   - After joining, you'll see your sandbox number
   - Format: `whatsapp:+14155238886` (or similar)

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Application URL (for QR code access)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Or for production:
# NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Step 4: Test WhatsApp Delivery

1. **Create a test ticket** (use free test ticket)
2. **Approve the ticket:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/tickets/{TICKET_ID}/approve \
     -H "Content-Type: application/json" \
     -d '{"approvedBy": "admin"}'
   ```

3. **Check your WhatsApp:**
   - You should receive a message with:
     - Event details
     - Ticket information
     - QR code image

## Important Notes

### Sandbox Limitations

- **Only works with joined numbers:** Recipients must join the sandbox first
- **24-hour window:** After joining, you can send messages for 24 hours
- **Re-join required:** After 24 hours, recipients need to re-join

### Testing Flow

1. **Join Sandbox:**
   - Send `join <code>` to Twilio WhatsApp number
   - Wait for confirmation message

2. **Create Ticket:**
   - Use the free test ticket
   - Enter your WhatsApp number (the one that joined sandbox)
   - Complete booking

3. **Approve Ticket:**
   - Use admin API to approve
   - QR code is generated
   - WhatsApp message is sent

4. **Verify Delivery:**
   - Check WhatsApp for message
   - QR code image should be attached
   - Click QR code to verify it opens `/verify/{ticketId}`

## Troubleshooting

### Message Not Received

1. **Check Sandbox Status:**
   - Verify you've joined the sandbox
   - Check if 24-hour window expired
   - Re-join if needed

2. **Verify Phone Number:**
   - Ensure number is in correct format
   - Check Twilio logs in console
   - Verify number matches sandbox joined number

3. **Check Environment Variables:**
   ```bash
   # Verify they're set
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_WHATSAPP_FROM
   ```

4. **Check Server Logs:**
   - Look for Twilio errors
   - Check QR code URL is accessible
   - Verify database has user info

### QR Code Not Attaching

1. **Verify QR Code URL:**
   - Check QR code is generated: `/public/qr-codes/{ticketId}.png`
   - Verify URL is publicly accessible
   - Test URL in browser

2. **Check Base URL:**
   - Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
   - For local: `http://localhost:3000`
   - For production: `https://your-domain.com`

3. **Twilio Media Requirements:**
   - URL must be publicly accessible (no localhost in production)
   - Must be HTTPS in production
   - Image must be valid PNG/JPG

### Common Errors

**Error 21211:** Invalid phone number
- Solution: Check phone number format
- Use E.164 format: `+1234567890`

**Error 21608:** Unsubscribed recipient
- Solution: Recipient must join sandbox
- Send `join <code>` to Twilio number

**Error 21610:** Not opted in
- Solution: Re-join sandbox
- Wait for confirmation

## Production Setup

For production, you'll need:

1. **Twilio WhatsApp Business Account:**
   - Apply for WhatsApp Business API access
   - Complete business verification
   - Get approved WhatsApp number

2. **Update Environment:**
   ```env
   TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

3. **Remove Sandbox Limitations:**
   - No need to join sandbox
   - No 24-hour window
   - Works with any WhatsApp number

## Testing Checklist

- [ ] Twilio account created
- [ ] Sandbox joined
- [ ] Environment variables set
- [ ] Test ticket created
- [ ] Ticket approved via API
- [ ] WhatsApp message received
- [ ] QR code image attached
- [ ] QR code opens verification page
- [ ] Entry verification works

## Next Steps

Once testing works:
1. Set up production Twilio WhatsApp Business Account
2. Update environment variables
3. Test with real phone numbers
4. Monitor delivery rates
5. Set up error alerts

