import type { Ticket } from "@/config/tickets";
import { GST_RATE } from "@/config/tickets";

const WHATSAPP_NUMBER = "7014133811";
const EVENT_NAME = "Luxe Legacy Show – Afterparty";
const EVENT_DATE = "16 January";

/**
 * Extracts the number of persons from ticket name or entry details
 */
function extractPersonCount(ticket: Ticket): number {
  // Try to extract from name first (e.g., "1 Person", "2 Persons", "3 Persons")
  const nameMatch = ticket.name.match(/(\d+)\s+Person/i);
  if (nameMatch) {
    return parseInt(nameMatch[1], 10);
  }

  // Try to extract from entry details
  const entryMatch = ticket.entryDetails.match(/(\d+)\s+guest/i);
  if (entryMatch) {
    return parseInt(entryMatch[1], 10);
  }

  // Default to 1 if not found
  return 1;
}

/**
 * Extracts cover amount from ticket name or cover details
 */
function extractCoverAmount(ticket: Ticket): number | null {
  // Try to extract from name first (e.g., "₹2000 Cover", "₹1000 Cover")
  const nameMatch = ticket.name.match(/₹(\d+)\s+Cover/i);
  if (nameMatch) {
    return parseInt(nameMatch[1], 10);
  }

  // Try to extract from cover details
  const coverMatch = ticket.coverDetails.match(/₹(\d+)/);
  if (coverMatch) {
    return parseInt(coverMatch[1], 10);
  }

  return null;
}

/**
 * Formats currency in Indian Rupees
 */
function formatCurrencyInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Builds a WhatsApp booking message based on ticket details
 */
export function buildWhatsAppBookingMessage(ticket: Ticket): string {
  const personCount = extractPersonCount(ticket);
  const coverAmount = extractCoverAmount(ticket);
  const gstAmount = ticket.priceInr * GST_RATE;
  const totalWithGst = Math.round(ticket.priceInr + gstAmount);

  let message = `Hi, I'd like to book a ticket for the ${EVENT_NAME} on ${EVENT_DATE}.\n\n`;
  
  message += `📋 *Ticket Details:*\n`;
  message += `• Ticket: ${ticket.name}\n`;
  message += `• Number of Persons: ${personCount}\n`;
  message += `• Entry: ${ticket.entryDetails}\n`;
  
  if (coverAmount) {
    message += `• Cover Amount: ${formatCurrencyInr(coverAmount)}\n`;
  }
  
  message += `• Base Price: ${formatCurrencyInr(ticket.priceInr)}\n`;
  message += `• GST (18%): ${formatCurrencyInr(gstAmount)}\n`;
  message += `• *Total Amount: ${formatCurrencyInr(totalWithGst)}*\n`;
  
  if (ticket.includesComplimentaryFood) {
    message += `• Complimentary food included\n`;
  }
  
  message += `\nPlease confirm the booking and share the next steps for ticket confirmation.`;

  return message;
}

/**
 * Builds a WhatsApp wa.me link with pre-filled booking message
 */
export function buildWhatsAppLink(ticket: Ticket): string {
  const message = buildWhatsAppBookingMessage(ticket);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

