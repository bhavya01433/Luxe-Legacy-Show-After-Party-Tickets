import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrCodeImage, getVerificationUrl } from "@/lib/qrcode";
import { sendWhatsAppMessage, generateTicketWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST /api/admin/tickets/[ticketId]/approve
 * Approves a ticket and sends QR code via WhatsApp
 * 
 * Security: In production, add authentication middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const body = await request.json();
    const approvedBy = body.approvedBy || "admin"; // In production, get from auth session

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { uniqueTicketId: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (ticket.isApproved) {
      return NextResponse.json(
        { error: "Ticket already approved", ticketId },
        { status: 400 }
      );
    }

    // Validate user information
    if (!ticket.userName || !ticket.whatsappNumber || !ticket.email) {
      return NextResponse.json(
        {
          error: "Ticket missing user information. Cannot approve without name, WhatsApp, and email.",
        },
        { status: 400 }
      );
    }

    // Generate verification URL
    const verificationUrl = getVerificationUrl(ticket.uniqueTicketId);

    // Generate QR code image
    let qrCodeUrl: string;
    try {
      qrCodeUrl = await generateQrCodeImage(ticket.uniqueTicketId, verificationUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      return NextResponse.json(
        { error: "Failed to generate QR code" },
        { status: 500 }
      );
    }

    // Generate full QR code URL for WhatsApp
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const fullQrCodeUrl = `${baseUrl}${qrCodeUrl}`;

    // Generate WhatsApp message
    const whatsappMessage = generateTicketWhatsAppMessage(
      ticket.userName,
      "Luxe Legacy Show – Afterparty",
      "16 January",
      ticket.ticketTypeName,
      ticket.maxEntries,
      verificationUrl
    );

    // Send WhatsApp message with QR code
    const whatsappResult = await sendWhatsAppMessage({
      to: ticket.whatsappNumber,
      message: whatsappMessage,
      mediaUrl: fullQrCodeUrl,
    });

    if (!whatsappResult.success) {
      // Log error but still approve ticket
      console.error("Failed to send WhatsApp:", whatsappResult.error);
      // You might want to queue this for retry
    }

    // Update ticket: mark as approved and QR code sent
    const updatedTicket = await prisma.ticket.update({
      where: { uniqueTicketId: ticketId },
      data: {
        isApproved: true,
        qrCodeSent: whatsappResult.success,
        qrCodeSentAt: whatsappResult.success ? new Date() : null,
        approvedAt: new Date(),
        approvedBy,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedTicket.uniqueTicketId,
        isApproved: updatedTicket.isApproved,
        qrCodeSent: updatedTicket.qrCodeSent,
        whatsappSent: whatsappResult.success,
        whatsappMessageId: whatsappResult.messageId,
        qrCodeUrl,
      },
      message: whatsappResult.success
        ? "Ticket approved and QR code sent via WhatsApp"
        : "Ticket approved but WhatsApp delivery failed. QR code generated.",
    });
  } catch (error: any) {
    console.error("Error approving ticket:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

