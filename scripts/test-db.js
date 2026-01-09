// Quick test script to verify database connection
// Run with: node scripts/test-db.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection...\n");

    // Test 1: Count tickets
    const ticketCount = await prisma.ticket.count();
    console.log(`✅ Connected! Found ${ticketCount} tickets in database.\n`);

    // Test 2: List all tickets
    const tickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (tickets.length > 0) {
      console.log("📋 Recent tickets:");
      tickets.forEach((ticket) => {
        console.log(`  - ${ticket.uniqueTicketId}`);
        console.log(`    Type: ${ticket.ticketTypeName}`);
        console.log(`    Entries: ${ticket.usedEntries}/${ticket.maxEntries}`);
        console.log(`    Valid: ${ticket.isValid ? "Yes" : "No"}`);
        console.log("");
      });
    } else {
      console.log("📭 No tickets found. Create one via the payment flow!\n");
    }

    // Test 3: Create a test ticket
    console.log("🧪 Creating test ticket...");
    const testTicket = await prisma.ticket.create({
      data: {
        uniqueTicketId: `TKT-TEST-${Date.now()}`,
        bookingId: "LL-TEST-001",
        ticketTypeId: "only-entry-1",
        ticketTypeName: "Test Ticket",
        maxEntries: 1,
        usedEntries: 0,
        isValid: true,
      },
    });
    console.log(`✅ Test ticket created: ${testTicket.uniqueTicketId}\n`);

    // Test 4: Verify ticket
    const verified = await prisma.ticket.findUnique({
      where: { uniqueTicketId: testTicket.uniqueTicketId },
    });
    console.log(`✅ Ticket verified: ${verified ? "Found" : "Not found"}\n`);

    console.log("🎉 All database tests passed!\n");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();

