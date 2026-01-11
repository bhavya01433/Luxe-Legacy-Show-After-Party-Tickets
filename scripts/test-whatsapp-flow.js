// Test script for complete WhatsApp QR code delivery flow
// Run with: node scripts/test-whatsapp-flow.js

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function testCompleteFlow() {
  console.log("🧪 Testing Complete WhatsApp QR Code Delivery Flow\n");

  // Step 1: Create a test ticket
  console.log("Step 1: Creating test ticket...");
  const ticketData = {
    uniqueTicketId: `TKT-TEST-${Date.now()}`,
    bookingId: `LL-TEST-${Date.now()}`,
    ticketTypeId: "free-test-entry",
    ticketTypeName: "Free Test Entry (1 Person) - Testing Only",
    maxEntries: 1,
    userName: "Test User",
    whatsappNumber: "+919876543210", // Replace with your WhatsApp number
    email: "test@example.com",
  };

  try {
    const createResponse = await fetch(`${BASE_URL}/api/tickets/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Failed to create ticket: ${error.error}`);
    }

    const createResult = await createResponse.json();
    console.log(`✅ Ticket created: ${createResult.ticketId}\n`);

    // Step 2: Approve ticket (this triggers QR generation and WhatsApp)
    console.log("Step 2: Approving ticket and sending WhatsApp...");
    const approveResponse = await fetch(
      `${BASE_URL}/api/admin/tickets/${createResult.ticketId}/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "test-admin" }),
      }
    );

    if (!approveResponse.ok) {
      const error = await approveResponse.json();
      throw new Error(`Failed to approve ticket: ${error.error}`);
    }

    const approveResult = await approveResponse.json();
    console.log(`✅ Ticket approved\n`);
    console.log(`📱 WhatsApp Status: ${approveResult.ticket.whatsappSent ? "✅ Sent" : "❌ Failed"}`);
    console.log(`📄 QR Code URL: ${approveResult.ticket.qrCodeUrl}`);
    console.log(`🔗 Verification URL: ${approveResult.ticket.verificationUrl}\n`);

    if (approveResult.ticket.whatsappSent) {
      console.log("✅ Complete flow successful!");
      console.log(`\nCheck your WhatsApp (${ticketData.whatsappNumber}) for the QR code message.`);
    } else {
      console.log("⚠️  Ticket approved but WhatsApp delivery failed.");
      console.log(`Error: ${approveResult.message}`);
      console.log("\nCheck:");
      console.log("1. Twilio credentials are set in .env");
      console.log("2. WhatsApp number has joined Twilio sandbox");
      console.log("3. QR code URL is accessible:", approveResult.ticket.qrCodeUrl);
    }

    // Step 3: Verify ticket status
    console.log("\nStep 3: Verifying ticket status...");
    const verifyResponse = await fetch(
      `${BASE_URL}/api/tickets/${createResult.ticketId}`
    );

    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log(`✅ Ticket Status: ${verifyResult.valid ? "Valid" : "Invalid"}`);
      console.log(`   Remaining Entries: ${verifyResult.remainingEntries}/${verifyResult.maxEntries}`);
    }

    console.log("\n🎉 Test complete!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testCompleteFlow();

