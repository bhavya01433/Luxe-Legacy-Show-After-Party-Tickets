import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrCodeImage, getVerificationUrl, getQrCodePublicUrl } from "@/lib/qrcode";
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

    // Generate QR code image (saves to /public/qr-codes/{ticketId}.png)
    let qrCodeUrl: string;
    try {
      qrCodeUrl = await generateQrCodeImage(ticket.uniqueTicketId, verificationUrl);
      console.log(`QR code generated: ${qrCodeUrl}`);
    } catch (error) {
      console.error("Error generating QR code:", error);
      return NextResponse.json(
        { error: "Failed to generate QR code" },
        { status: 500 }
      );
    }

    // Generate full public URL for QR code (must be accessible for Twilio)
    const fullQrCodeUrl = getQrCodePublicUrl(ticket.uniqueTicketId);
    console.log(`QR code public URL: ${fullQrCodeUrl}`);

    // Generate WhatsApp message using user's name from database
    const whatsappMessage = generateTicketWhatsAppMessage(
      ticket.userName!, // Fetched from database
      "Luxe Legacy Show – Afterparty",
      "16 January",
      ticket.ticketTypeName,
      ticket.maxEntries,
      verificationUrl
    );

    console.log(`Sending WhatsApp to: ${ticket.whatsappNumber}`);
    console.log(`User name: ${ticket.userName}`);

    // Send WhatsApp message with QR code image
    // Twilio will fetch the QR code image from the public URL
    const whatsappResult = await sendWhatsAppMessage({
      to: ticket.whatsappNumber!, // Fetched from database
      message: whatsappMessage,
      mediaUrl: fullQrCodeUrl, // Public URL - Twilio will download and attach
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
        userName: updatedTicket.userName,
        whatsappNumber: updatedTicket.whatsappNumber,
        isApproved: updatedTicket.isApproved,
        qrCodeSent: updatedTicket.qrCodeSent,
        whatsappSent: whatsappResult.success,
        whatsappMessageId: whatsappResult.messageId,
        qrCodeUrl: fullQrCodeUrl,
        verificationUrl,
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

