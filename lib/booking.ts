/**
 * Generates a unique booking ID
 * Format: LL-{TIMESTAMP}-{RANDOM}
 * In production, this should come from your backend/booking system
 */
export function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LL-${timestamp}-${random}`;
}

/**
 * Validates a booking ID format
 */
export function isValidBookingId(bookingId: string): boolean {
  return /^LL-[A-Z0-9]+-[A-Z0-9]+$/.test(bookingId);
}

