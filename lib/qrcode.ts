/**
 * QR Code generation service
 * Generates QR codes for ticket verification
 */

import QRCode from "qrcode";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const QR_CODE_DIR = join(process.cwd(), "public", "qr-codes");

/**
 * Ensures QR code directory exists
 */
async function ensureQrCodeDirectory(): Promise<void> {
  if (!existsSync(QR_CODE_DIR)) {
    await mkdir(QR_CODE_DIR, { recursive: true });
  }
}

/**
 * Generates a QR code image for a ticket verification URL
 * @param ticketId - Unique ticket ID
 * @param verificationUrl - Full verification URL
 * @returns Public URL to the QR code image
 */
export async function generateQrCodeImage(
  ticketId: string,
  verificationUrl: string
): Promise<string> {
  try {
    await ensureQrCodeDirectory();

    const fileName = `${ticketId}.png`;
    const filePath = join(QR_CODE_DIR, fileName);

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
      type: "png",
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H", // High error correction for better scanning
    });

    // Save to file
    await writeFile(filePath, qrCodeBuffer);

    // Return public URL
    const publicUrl = `/qr-codes/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code image");
  }
}

/**
 * Generates QR code data URL (base64) for direct embedding
 * Useful for WhatsApp media or email
 */
export async function generateQrCodeDataUrl(
  verificationUrl: string
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H",
    });
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code data URL:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Gets the full verification URL for a ticket
 */
export function getVerificationUrl(ticketId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/verify/${ticketId}`;
}

/**
 * Gets the base URL for the application
 * Handles Vercel deployment URLs properly
 */
export function getBaseUrl(): string {
  // In production, use NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // On Vercel, use VERCEL_URL with https
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return "http://localhost:3000";
}

/**
 * Gets the full public URL for a QR code image
 */
export function getQrCodePublicUrl(ticketId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/qr-codes/${ticketId}.png`;
}

