"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Ticket } from "@/config/tickets";
import { GST_RATE } from "@/config/tickets";
import { generateUpiPaymentString } from "@/config/payment";
import { generateBookingId } from "@/lib/booking";
import { generateUniqueTicketId } from "@/lib/tickets";
import { TicketDisplay } from "@/components/TicketDisplay";
import { UserInfoForm } from "@/components/UserInfoForm";

type PaymentModalProps = {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed?: (ticket: Ticket, bookingId: string) => void;
};

const formatCurrencyInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Determines max entries based on ticket type
 * Extracts from ticket name (1 Person = 1, 2 Persons = 2, 3 Persons = 3)
 */
function getMaxEntries(ticketName: string): number {
  if (ticketName.includes("3 Persons") || ticketName.includes("3 persons")) {
    return 3;
  }
  if (ticketName.includes("2 Persons") || ticketName.includes("2 persons")) {
    return 2;
  }
  return 1; // Default to 1 person
}

export function PaymentModal({
  ticket,
  isOpen,
  onClose,
  onPaymentConfirmed,
}: PaymentModalProps) {
  const [step, setStep] = useState<"userInfo" | "payment" | "confirmed">("userInfo");
  const [userInfo, setUserInfo] = useState<{
    userName: string;
    whatsappNumber: string;
    email: string;
  } | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [uniqueTicketId, setUniqueTicketId] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  // If payment is confirmed, show ticket display
  if (isPaymentConfirmed && bookingId && uniqueTicketId) {
    return (
      <TicketDisplay
        ticket={ticket}
        bookingId={bookingId}
        uniqueTicketId={uniqueTicketId}
        onClose={onClose}
      />
    );
  }

  const gstAmount = ticket.priceInr * GST_RATE;
  const totalWithGst = Math.round(ticket.priceInr + gstAmount);
  const upiPaymentString = generateUpiPaymentString(
    totalWithGst,
    `Luxe Legacy Show - ${ticket.name}`,
  );

  const handleUpiClick = () => {
    // Try to open UPI app via deep link
    window.location.href = upiPaymentString;
  };

  const handleUserInfoSubmit = async (data: {
    userName: string;
    whatsappNumber: string;
    email: string;
  }) => {
    setUserInfo(data);
    
    // If free ticket, skip payment and create ticket directly
    if (ticket.isFree) {
      await handleFreeTicketCreation(data);
    } else {
      setStep("payment");
    }
  };

  const handleFreeTicketCreation = async (userData: {
    userName: string;
    whatsappNumber: string;
    email: string;
  }) => {
    const newBookingId = generateBookingId();
    const newUniqueTicketId = generateUniqueTicketId();
    const maxEntries = getMaxEntries(ticket.name);

    try {
      const response = await fetch("/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueTicketId: newUniqueTicketId,
          bookingId: newBookingId,
          ticketTypeId: ticket.id,
          ticketTypeName: ticket.name,
          maxEntries,
          userName: userData.userName,
          whatsappNumber: userData.whatsappNumber,
          email: userData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

      const result = await response.json();

      setBookingId(newBookingId);
      setUniqueTicketId(newUniqueTicketId);
      setIsPaymentConfirmed(true);
      setStep("confirmed");

      if (onPaymentConfirmed) {
        onPaymentConfirmed(ticket, newBookingId);
      }
    } catch (error: any) {
      console.error("Error creating free ticket:", error);
      alert(`Error creating ticket: ${error.message}. Please try again.`);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!userInfo) {
      alert("Please provide your information first");
      return;
    }

    const newBookingId = generateBookingId();
    const newUniqueTicketId = generateUniqueTicketId();
    const maxEntries = getMaxEntries(ticket.name);

    // Create ticket entry in the system with user information
    try {
      const response = await fetch("/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueTicketId: newUniqueTicketId,
          bookingId: newBookingId,
          ticketTypeId: ticket.id,
          ticketTypeName: ticket.name,
          maxEntries,
          // User information
          userName: userInfo.userName,
          whatsappNumber: userInfo.whatsappNumber,
          email: userInfo.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket entry");
      }

      const result = await response.json();

      setBookingId(newBookingId);
      setUniqueTicketId(newUniqueTicketId);
      setIsPaymentConfirmed(true);
      setStep("confirmed");

      if (onPaymentConfirmed) {
        onPaymentConfirmed(ticket, newBookingId);
      }

      // Show message about approval
      if (result.requiresApproval) {
        // Message will be shown in the ticket display
      }
    } catch (error: any) {
      console.error("Error creating ticket entry:", error);
      alert(
        `Payment confirmed, but there was an error creating your ticket: ${error.message}. Please contact support.`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
          aria-label="Close payment modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        {step === "userInfo" ? (
          <div className="space-y-6">
            <div className="space-y-2 pr-8">
              <h2
                id="payment-modal-title"
                className="text-xl font-semibold text-neutral-50"
              >
                Your Information
              </h2>
              <p className="text-sm text-neutral-300">
                We need your details to send the entry QR code
              </p>
            </div>
            <UserInfoForm
              onSubmit={handleUserInfoSubmit}
              onCancel={onClose}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 pr-8">
              <h2
                id="payment-modal-title"
                className="text-xl font-semibold text-neutral-50"
              >
                {ticket.isFree ? "Confirm Booking" : "Pay via UPI"}
              </h2>
              <p className="text-sm text-neutral-300">{ticket.name}</p>
            </div>

            {!ticket.isFree && (
              <>
                {/* Amount */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-neutral-400">Total Amount</span>
                    <span className="text-2xl font-semibold text-amber-300">
                      {formatCurrencyInr(totalWithGst)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Includes 18% GST
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-xl border-2 border-neutral-800 bg-white p-4">
                    <QRCodeSVG
                      value={upiPaymentString}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-center text-sm text-neutral-400">
                    Scan with any UPI app to pay
                  </p>
                </div>

                {/* UPI Deep Link Button */}
                <button
                  type="button"
                  onClick={handleUpiClick}
                  className="w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold tracking-wide text-neutral-950 shadow-sm transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Open UPI App
                </button>

                {/* Payment Confirmation Button (for demo/testing) */}
                <button
                  type="button"
                  onClick={handlePaymentConfirmed}
                  className="w-full rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  I&apos;ve Completed Payment
                </button>
              </>
            )}

            {ticket.isFree && (
              <>
                {/* Free Ticket Info */}
                <div className="rounded-xl border border-emerald-800 bg-emerald-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm font-medium text-emerald-300">
                      Free Test Ticket
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    This is a test ticket for verifying the complete flow. No payment required.
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handlePaymentConfirmed}
                  className="w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold tracking-wide text-neutral-950 shadow-sm transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/70"
                >
                  Confirm Booking
                </button>
              </>
            )}

            {/* Instructions */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
              <p className="text-xs leading-relaxed text-neutral-400">
                <span className="font-medium text-neutral-300">
                  {ticket.isFree ? "Next steps:" : "After payment:"}
                </span>{" "}
                {ticket.isFree
                  ? "Your ticket will be created and sent for admin approval. You'll receive the entry QR code on WhatsApp after approval."
                  : "Click \"I've Completed Payment\" to complete your booking. Your ticket will be reviewed and you'll receive the entry QR code on WhatsApp after approval."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

