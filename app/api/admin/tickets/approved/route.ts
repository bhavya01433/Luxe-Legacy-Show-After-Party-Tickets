import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/tickets/approved
 * Gets all approved tickets
 * 
 * Security: In production, add authentication middleware
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: {
          isApproved: true,
        },
        orderBy: {
          approvedAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          uniqueTicketId: true,
          bookingId: true,
          ticketTypeName: true,
          maxEntries: true,
          usedEntries: true,
          userName: true,
          whatsappNumber: true,
          email: true,
          qrCodeSent: true,
          qrCodeSentAt: true,
          approvedAt: true,
          approvedBy: true,
          createdAt: true,
        },
      }),
      prisma.ticket.count({
        where: {
          isApproved: true,
        },
      }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching approved tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

