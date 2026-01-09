"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface TicketStatus {
  valid: boolean;
  reason?: string;
  ticketTypeName?: string;
  remainingEntries?: number;
  maxEntries?: number;
  usedEntries?: number;
}

export default function VerifyTicketPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string;
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (ticketId) {
      validateTicket(ticketId);
    }
  }, [ticketId]);

  const validateTicket = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${id}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error validating ticket:", error);
      setStatus({
        valid: false,
        reason: "Error validating ticket",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkEntry = async () => {
    if (!ticketId || !status?.valid) return;

    try {
      setMarking(true);
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark entry");
      }

      const data = await response.json();

      // Refresh status after marking
      await validateTicket(ticketId);
    } catch (error) {
      console.error("Error marking entry:", error);
      alert("Failed to mark entry. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-xl font-semibold text-neutral-50">
            Validating ticket...
          </p>
        </div>
      </div>
    );
  }

  const isValid = status?.valid === true;
  const remainingEntries = status?.remainingEntries ?? 0;
  const maxEntries = status?.maxEntries ?? 0;

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center px-4 py-8 ${
        isValid ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <div className="w-full max-w-md text-center">
        {/* Status Icon */}
        <div className="mb-6 text-6xl">
          {isValid ? "✅" : "❌"}
        </div>

        {/* Main Status Text */}
        <h1
          className={`mb-4 text-4xl font-bold tracking-tight sm:text-5xl ${
            isValid ? "text-white" : "text-white"
          }`}
        >
          {isValid ? "ENTRY ALLOWED" : "ENTRY DENIED"}
        </h1>

        {/* Reason for denial */}
        {!isValid && status?.reason && (
          <p className="mb-6 text-xl font-semibold text-white/90">
            {status.reason === "Ticket already used"
              ? "ALREADY USED"
              : status.reason.toUpperCase()}
          </p>
        )}

        {/* Ticket Details (only if valid) */}
        {isValid && status.ticketTypeName && (
          <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="space-y-3 text-left">
              <div>
                <p className="text-sm font-medium text-white/80">Ticket Type</p>
                <p className="text-lg font-semibold text-white">
                  {status.ticketTypeName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">
                  Remaining Entries
                </p>
                <p className="text-3xl font-bold text-white">
                  {remainingEntries} / {maxEntries}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mark Entry Button (only if valid and has remaining entries) */}
        {isValid && remainingEntries > 0 && (
          <button
            onClick={handleMarkEntry}
            disabled={marking}
            className="w-full rounded-full bg-white px-8 py-4 text-lg font-bold text-green-600 shadow-lg transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {marking ? "Marking Entry..." : "MARK ENTRY"}
          </button>
        )}

        {/* Locked message if no entries remaining */}
        {isValid && remainingEntries === 0 && (
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">
              Ticket Fully Used
            </p>
          </div>
        )}

        {/* Ticket ID (for reference) */}
        <div className="mt-8 rounded-lg bg-black/20 p-3">
          <p className="text-xs font-mono text-white/60">ID: {ticketId}</p>
        </div>
      </div>
    </div>
  );
}

