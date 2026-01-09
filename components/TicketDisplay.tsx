"use client";

import { QRCodeSVG } from "qrcode.react";
import type { Ticket } from "@/config/tickets";
import { GST_RATE } from "@/config/tickets";

type TicketDisplayProps = {
  ticket: Ticket;
  bookingId: string;
  uniqueTicketId: string; // Unique ticket ID for verification
  onClose?: () => void;
};

const formatCurrencyInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Generates the verification URL for the QR code
 * QR code points to /verify/{uniqueTicketId}
 */
function generateVerificationUrl(uniqueTicketId: string): string {
  // Get the current origin (works for both dev and production)
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";
  return `${origin}/verify/${uniqueTicketId}`;
}

export function TicketDisplay({
  ticket,
  bookingId,
  uniqueTicketId,
  onClose,
}: TicketDisplayProps) {
  const gstAmount = ticket.priceInr * GST_RATE;
  const totalWithGst = Math.round(ticket.priceInr + gstAmount);
  const verificationUrl = generateVerificationUrl(uniqueTicketId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 space-y-2 border-b border-neutral-800 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
            Your Entry Ticket
          </h1>
          <p className="text-sm text-neutral-400">
            Luxe Legacy Show – Afterparty • 16 January
          </p>
        </div>

        {/* Ticket Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_1px_0_rgba(255,255,255,0.03)] sm:p-8">
          <div className="space-y-6">
            {/* Booking Details */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Booking Reference
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-amber-300">
                  {bookingId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Ticket
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-50">
                  {ticket.name}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                    Amount Paid
                  </p>
                  <p className="mt-1 text-xl font-semibold text-amber-300">
                    {formatCurrencyInr(totalWithGst)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-400">
                    ✓ Confirmed
                  </p>
                </div>
              </div>
            </div>

            {/* Entry QR Code */}
            <div className="space-y-4 border-t border-neutral-800 pt-6">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Entry QR Code
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  Present this QR code at the venue for entry
                </p>
              </div>

              <div className="flex justify-center">
                <div className="rounded-xl border-2 border-amber-300/20 bg-white p-6 shadow-lg">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={240}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono text-neutral-400">
                  Ticket ID: {uniqueTicketId}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
                <p className="text-center text-xs leading-relaxed text-neutral-400">
                  <span className="font-medium text-neutral-300">Important:</span>{" "}
                  Keep this QR code safe. You&apos;ll need to scan it at the venue
                  entry. A copy has also been sent to your WhatsApp.
                </p>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-3 border-t border-neutral-800 pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Ticket Details
              </p>
              <dl className="space-y-2 text-sm text-neutral-300">
                <div className="flex justify-between">
                  <dt>Entry:</dt>
                  <dd className="text-right">{ticket.entryDetails}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Cover:</dt>
                  <dd className="text-right">{ticket.coverDetails}</dd>
                </div>
                {ticket.includesComplimentaryFood && (
                  <div className="flex justify-between">
                    <dt>Food:</dt>
                    <dd className="text-right font-medium text-emerald-300">
                      Complimentary food included
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Venue Info */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Venue & Entry
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                Venue details will be shared via WhatsApp. Please arrive with a
                valid government ID.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {onClose && (
          <div className="mt-8">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

