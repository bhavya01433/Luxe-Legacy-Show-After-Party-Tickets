import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrCodeImage, getVerificationUrl, getQrCodePublicUrl } from "@/lib/qrcode";
import { sendWhatsAppMessage, generateTicketWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST /api/tickets/[ticketId]/send-qr
 * Generates QR code and sends it via WhatsApp for an approved ticket
 * Useful for resending QR codes or manual triggers
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

    // Fetch ticket from database
    const ticket = await prisma.ticket.findUnique({
      where: { uniqueTicketId: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Validate ticket is approved
    if (!ticket.isApproved) {
      return NextResponse.json(
        { error: "Ticket must be approved before sending QR code" },
        { status: 400 }
      );
    }

    // Validate user information exists
    if (!ticket.userName || !ticket.whatsappNumber || !ticket.email) {
      return NextResponse.json(
        {
          error: "Ticket missing user information. Cannot send QR code without name, WhatsApp, and email.",
        },
        { status: 400 }
      );
    }

    // Generate verification URL
    const verificationUrl = getVerificationUrl(ticket.uniqueTicketId);

    // Generate QR code image (saves to /public/qr-codes/)
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

    // Get full public URL for QR code
    const fullQrCodeUrl = getQrCodePublicUrl(ticket.uniqueTicketId);

    // Generate WhatsApp message with user's name from database
    const whatsappMessage = generateTicketWhatsAppMessage(
      ticket.userName, // Fetched from database
      "Luxe Legacy Show – Afterparty",
      "16 January",
      ticket.ticketTypeName,
      ticket.maxEntries,
      verificationUrl
    );

    // Send WhatsApp message with QR code image
    const whatsappResult = await sendWhatsAppMessage({
      to: ticket.whatsappNumber, // Fetched from database
      message: whatsappMessage,
      mediaUrl: fullQrCodeUrl, // Public URL to QR code image
    });

    // Update ticket status
    if (whatsappResult.success) {
      await prisma.ticket.update({
        where: { uniqueTicketId: ticketId },
        data: {
          qrCodeSent: true,
          qrCodeSentAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: whatsappResult.success,
      ticketId: ticket.uniqueTicketId,
      userName: ticket.userName,
      whatsappNumber: ticket.whatsappNumber,
      qrCodeUrl: fullQrCodeUrl,
      verificationUrl,
      whatsappMessageId: whatsappResult.messageId,
      error: whatsappResult.error,
      message: whatsappResult.success
        ? `QR code sent successfully to ${ticket.whatsappNumber}`
        : `Failed to send QR code: ${whatsappResult.error}`,
    });
  } catch (error: any) {
    console.error("Error sending QR code:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

