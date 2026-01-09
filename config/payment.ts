// Payment configuration for UPI integration
// 
// To set up UPI payments:
// 1. Get a UPI ID from your payment provider (Paytm, PhonePe, Google Pay, etc.)
//    Format examples: "merchant@paytm", "merchant@ybl", "merchant@upi"
// 2. Replace the UPI_ID below with your actual UPI ID
// 3. Update MERCHANT_NAME if needed
//
// Note: For production, consider using a payment gateway API (Razorpay, Paytm, etc.)
//       for better payment tracking and confirmation handling.
export const UPI_ID = "7014133811@ybl"; // Replace with actual UPI ID
export const MERCHANT_NAME = "Luxe Legacy Show";

/**
 * Generates a UPI payment string for the given amount and description
 * Format: upi://pay?pa=UPI_ID&pn=MERCHANT_NAME&am=AMOUNT&cu=INR&tn=DESCRIPTION
 */
export function generateUpiPaymentString(
  amount: number,
  description: string,
): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: description,
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates a UPI payment URL (for web fallback)
 */
export function generateUpiPaymentUrl(
  amount: number,
  description: string,
): string {
  // Some UPI apps support web URLs, but deep link is preferred
  return generateUpiPaymentString(amount, description);
}

