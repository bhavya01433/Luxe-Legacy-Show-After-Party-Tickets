import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tickets/create
 * Creates a new ticket entry after payment confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      uniqueTicketId,
      bookingId,
      ticketTypeId,
      ticketTypeName,
      maxEntries,
    } = body;

    if (
      !uniqueTicketId ||
      !bookingId ||
      !ticketTypeId ||
      !ticketTypeName ||
      !maxEntries
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if ticket already exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { uniqueTicketId },
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: "Ticket already exists" },
        { status: 409 }
      );
    }

    // Create the ticket entry
    const ticket = await prisma.ticket.create({
      data: {
        uniqueTicketId,
        bookingId,
        ticketTypeId,
        ticketTypeName,
        maxEntries,
        usedEntries: 0,
        isValid: true,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.uniqueTicketId,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
