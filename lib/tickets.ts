/**
 * Generates a unique ticket ID for entry verification
 * Format: TKT-{TIMESTAMP}-{RANDOM}
 * This is different from booking ID - each ticket purchase gets a unique entry ID
 */
export function generateUniqueTicketId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

/**
 * Validates a ticket ID format
 */
export function isValidTicketId(ticketId: string): boolean {
  return /^TKT-[A-Z0-9]+-[A-Z0-9]+$/.test(ticketId);
}

