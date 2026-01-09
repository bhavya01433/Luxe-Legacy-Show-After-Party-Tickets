"use client";

import { useState } from "react";
import { TicketDisplay } from "@/components/TicketDisplay";
import { tickets } from "@/config/tickets";

export default function DemoTicketPage() {
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const selectedTicket = tickets[selectedTicketIndex];
  const demoBookingId = "LL-DEMO-2024-ABC123";
  const demoUniqueTicketId = "TKT-DEMO-2024-XYZ789";

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Ticket Selector (floating at top) */}
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-neutral-700 bg-neutral-900/90 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-400">Demo Ticket:</span>
          <select
            value={selectedTicketIndex}
            onChange={(e) => setSelectedTicketIndex(Number(e.target.value))}
            className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
          >
            {tickets.map((ticket, index) => (
              <option key={ticket.id} value={index}>
                {ticket.name}
              </option>
            ))}
          </select>
          <a
            href="/"
            className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-100 transition hover:bg-neutral-700"
          >
            ← Back
          </a>
        </div>
      </div>

      {/* Ticket Display */}
      <TicketDisplay
        ticket={selectedTicket}
        bookingId={demoBookingId}
        uniqueTicketId={demoUniqueTicketId}
        onClose={() => {
          window.location.href = "/";
        }}
      />
    </div>
  );
}

