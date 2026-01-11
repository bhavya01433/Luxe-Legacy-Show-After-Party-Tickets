import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrCodeImage, getVerificationUrl, getQrCodePublicUrl } from "@/lib/qrcode";
import { sendWhatsAppMessage, generateTicketWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST /api/cron/process-tickets
 * Automated cron job endpoint to process approved tickets
 * 
 * Security: Protect with Vercel Cron Secret or similar
 * Usage: Set up in Vercel Cron or external cron service
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (if using Vercel Cron)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all approved tickets that haven't received QR codes
    const tickets = await prisma.ticket.findMany({
      where: {
        isApproved: true,
        qrCodeSent: false,
      },
      take: 50, // Process in batches
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
          continue;
        }

        // Generate verification URL
        const verificationUrl = getVerificationUrl(ticket.uniqueTicketId);

        // Generate QR code image (saves to /public/qr-codes/)
        await generateQrCodeImage(
          ticket.uniqueTicketId,
          verificationUrl
        );

        // Get full public URL for QR code (must be accessible for Twilio)
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
          },
        });

        results.push({
          ticketId: ticket.uniqueTicketId,
          success: whatsappResult.success,
        });
      } catch (error: any) {
        console.error(`Error processing ticket ${ticket.uniqueTicketId}:`, error);
        results.push({
          ticketId: ticket.uniqueTicketId,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      results,
    });
  } catch (error: any) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

