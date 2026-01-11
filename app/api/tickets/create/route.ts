import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tickets/create
 * Creates a new ticket entry after payment confirmation
 * Includes user information for approval and WhatsApp delivery
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
      // User information
      userName,
      whatsappNumber,
      email,
    } = body;

    if (
      !uniqueTicketId ||
      !bookingId ||
      !ticketTypeId ||
      !ticketTypeName ||
      !maxEntries
    ) {
      return NextResponse.json(
        { error: "Missing required ticket fields" },
        { status: 400 }
      );
    }

    // User information is required for approval and WhatsApp delivery
    if (!userName || !whatsappNumber || !email) {
      return NextResponse.json(
        {
          error: "Missing user information. Please provide userName, whatsappNumber, and email.",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate WhatsApp number (basic check)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(whatsappNumber)) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number format" },
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

    // Create the ticket entry (pending approval)
    const ticket = await prisma.ticket.create({
      data: {
        uniqueTicketId,
        bookingId,
        ticketTypeId,
        ticketTypeName,
        maxEntries,
        usedEntries: 0,
        isValid: true,
        // User information
        userName,
        whatsappNumber,
        email,
        // Approval status (defaults to false)
        isApproved: false,
        qrCodeSent: false,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.uniqueTicketId,
      message: "Ticket created. Pending admin approval.",
      requiresApproval: true,
    });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
