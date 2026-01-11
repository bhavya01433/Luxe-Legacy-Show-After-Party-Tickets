import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrCodeImage, getVerificationUrl, getQrCodePublicUrl } from "@/lib/qrcode";
import { sendWhatsAppMessage, generateTicketWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST /api/admin/tickets/process-approved
 * Batch processes approved tickets and sends QR codes via WhatsApp
 * Useful for processing multiple tickets at once or retrying failed sends
 * 
 * Security: In production, add authentication middleware
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketIds, approvedBy } = body;

    // If specific ticket IDs provided, process only those
    // Otherwise, process all approved tickets that haven't received QR codes
    const whereClause = ticketIds
      ? {
          uniqueTicketId: { in: ticketIds },
          isApproved: true,
        }
      : {
          isApproved: true,
          qrCodeSent: false,
        };

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
    });

    if (tickets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No tickets to process",
        processed: 0,
      });
    }

    const results = [];

    for (const ticket of tickets) {
      try {
        // Validate user information
        if (!ticket.userName || !ticket.whatsappNumber || !ticket.email) {
          results.push({
            ticketId: ticket.uniqueTicketId,
            success: false,
            error: "Missing user information",
          });
          continue;
        }

        // Generate verification URL
        const verificationUrl = getVerificationUrl(ticket.uniqueTicketId);

        // Generate QR code image
        let qrCodeUrl: string;
        try {
          qrCodeUrl = await generateQrCodeImage(
            ticket.uniqueTicketId,
            verificationUrl
          );
        } catch (error) {
          results.push({
            ticketId: ticket.uniqueTicketId,
            success: false,
            error: "Failed to generate QR code",
          });
          continue;
        }

        // Generate full public URL for QR code (must be accessible for Twilio)
        const fullQrCodeUrl = getQrCodePublicUrl(ticket.uniqueTicketId);

        // Generate WhatsApp message using user's name from database
        const whatsappMessage = generateTicketWhatsAppMessage(
          ticket.userName!,
          "Luxe Legacy Show – Afterparty",
          "16 January",
          ticket.ticketTypeName,
          ticket.maxEntries,
          verificationUrl
        );

        // Send WhatsApp message with QR code image
        const whatsappResult = await sendWhatsAppMessage({
          to: ticket.whatsappNumber!,
          message: whatsappMessage,
          mediaUrl: fullQrCodeUrl,
        });

        // Update ticket
        await prisma.ticket.update({
          where: { uniqueTicketId: ticket.uniqueTicketId },
          data: {
            qrCodeSent: whatsappResult.success,
            qrCodeSentAt: whatsappResult.success ? new Date() : null,
            approvedAt: ticket.approvedAt || new Date(),
            approvedBy: approvedBy || ticket.approvedBy || "admin",
          },
        });

        results.push({
          ticketId: ticket.uniqueTicketId,
          userName: ticket.userName,
          whatsappNumber: ticket.whatsappNumber,
          success: whatsappResult.success,
          whatsappMessageId: whatsappResult.messageId,
          qrCodeUrl: fullQrCodeUrl,
          error: whatsappResult.error,
        });
      } catch (error: any) {
        results.push({
          ticketId: ticket.uniqueTicketId,
          success: false,
          error: error.message || "Processing failed",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: successCount,
      failed: failureCount,
      results,
    });
  } catch (error: any) {
    console.error("Error processing approved tickets:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

