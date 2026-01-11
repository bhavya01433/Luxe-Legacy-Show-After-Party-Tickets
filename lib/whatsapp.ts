/**
 * WhatsApp service for sending QR codes and notifications
 * Uses Twilio WhatsApp API
 */

interface WhatsAppMessage {
  to: string; // WhatsApp number in format: +1234567890
  message: string;
  mediaUrl?: string; // Optional: URL to QR code image
}

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // Format: whatsapp:+14155238886

/**
 * Formats phone number to E.164 format for WhatsApp
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If it starts with 0, remove it
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // If it doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  // Add + prefix
  return `+${cleaned}`;
}

/**
 * Sends WhatsApp message using Twilio
 * Works with Twilio WhatsApp Sandbox for testing
 */
export async function sendWhatsAppMessage({
  to,
  message,
  mediaUrl,
}: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.error("Twilio credentials not configured");
    return {
      success: false,
      error: "WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM",
    };
  }

  try {
    const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const formattedTo = formatWhatsAppNumber(to);

    // Log for debugging (remove in production)
    console.log(`Sending WhatsApp to: ${formattedTo}`);
    if (mediaUrl) {
      console.log(`QR Code URL: ${mediaUrl}`);
    }

    const messageData: any = {
      from: TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedTo}`,
      body: message,
    };

    // Add media if provided (QR code image)
    // Twilio requires the media URL to be publicly accessible
    if (mediaUrl) {
      // Ensure URL is absolute and accessible
      const absoluteMediaUrl = mediaUrl.startsWith("http")
        ? mediaUrl
        : `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${mediaUrl}`;
      
      messageData.mediaUrl = [absoluteMediaUrl];
      console.log(`Attaching media: ${absoluteMediaUrl}`);
    }

    const result = await twilio.messages.create(messageData);

    console.log(`WhatsApp message sent successfully. SID: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    
    // Provide more detailed error information
    let errorMessage = error.message || "Failed to send WhatsApp message";
    
    // Common Twilio errors
    if (error.code === 21211) {
      errorMessage = "Invalid phone number format";
    } else if (error.code === 21608) {
      errorMessage = "Unsubscribed recipient (not joined to WhatsApp Sandbox)";
    } else if (error.code === 21610) {
      errorMessage = "Recipient not opted in to receive messages";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generates a professional WhatsApp message for ticket QR code
 */
export function generateTicketWhatsAppMessage(
  userName: string,
  eventName: string,
  eventDate: string,
  ticketType: string,
  maxEntries: number,
  verificationUrl: string
): string {
  return `🎫 *Luxe Legacy Show – Afterparty*

Hello ${userName},

Your ticket has been approved! Here are your entry details:

*Event:* ${eventName}
*Date:* ${eventDate}
*Ticket Type:* ${ticketType}
*Entries Allowed:* ${maxEntries} ${maxEntries === 1 ? "person" : "people"}

Please present the QR code at the venue entry for scanning. Keep this message safe as you'll need it for entry.

*Important:*
• Arrive with a valid government ID
• Dress code: Black tie / High fashion
• Venue details will be shared separately

See you at the event! ✨`;
}

