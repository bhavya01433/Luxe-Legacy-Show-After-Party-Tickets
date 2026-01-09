import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tickets/[ticketId]
 * Validates a ticket and returns its status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { uniqueTicketId: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          reason: "Ticket not found",
          ticketId,
        },
        { status: 200 } // Return 200 so UI can handle it
      );
    }

    if (!ticket.isValid) {
      return NextResponse.json(
        {
          valid: false,
          reason: "Ticket is invalid or revoked",
          ticketId,
        },
        { status: 200 }
      );
    }

    const remainingEntries = ticket.maxEntries - ticket.usedEntries;

    if (remainingEntries <= 0) {
      return NextResponse.json(
        {
          valid: false,
          reason: "Ticket already used",
          ticketId,
          ticketTypeName: ticket.ticketTypeName,
          usedEntries: ticket.usedEntries,
          maxEntries: ticket.maxEntries,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      ticketId,
      ticketTypeName: ticket.ticketTypeName,
      remainingEntries,
      maxEntries: ticket.maxEntries,
      usedEntries: ticket.usedEntries,
    });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets/[ticketId]
 * Marks an entry as used (decrements remaining entries)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const ticket = await prisma.$transaction(async (tx) => {
      // First, get the current ticket state
      const currentTicket = await tx.ticket.findUnique({
        where: { uniqueTicketId: ticketId },
      });

      if (!currentTicket) {
        throw new Error("Ticket not found");
      }

      if (!currentTicket.isValid) {
        throw new Error("Ticket is invalid");
      }

      const remainingEntries = currentTicket.maxEntries - currentTicket.usedEntries;

      if (remainingEntries <= 0) {
        throw new Error("Ticket already fully used");
      }

      // Increment used entries
      const newUsedEntries = currentTicket.usedEntries + 1;
      const isFullyUsed = newUsedEntries >= currentTicket.maxEntries;

      // Update ticket
      const updatedTicket = await tx.ticket.update({
        where: { uniqueTicketId: ticketId },
        data: {
          usedEntries: newUsedEntries,
          isValid: !isFullyUsed, // Lock ticket if fully used
        },
      });

      return updatedTicket;
    });

    return NextResponse.json({
      success: true,
      ticketId,
      remainingEntries: ticket.maxEntries - ticket.usedEntries,
      maxEntries: ticket.maxEntries,
      usedEntries: ticket.usedEntries,
      isLocked: !ticket.isValid,
    });
  } catch (error: any) {
    console.error("Error marking entry:", error);

    // Handle specific error cases
    if (error.message === "Ticket not found") {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (
      error.message === "Ticket is invalid" ||
      error.message === "Ticket already fully used"
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
