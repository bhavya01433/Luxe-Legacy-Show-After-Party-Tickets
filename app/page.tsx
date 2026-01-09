"use client";

import { useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { PaymentModal } from "@/components/PaymentModal";
import { tickets } from "@/config/tickets";
import type { Ticket } from "@/config/tickets";

const WHATSAPP_NUMBER = "7014133811"; 

const WHATSAPP_MESSAGE =
  "Hi, I'd like to book a table for the Luxe Legacy Show – Afterparty on 16 January. Please share available table options, minimum spends and inclusions.";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export default function Home() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleProceedWithUpi = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    // Clear selected ticket after a short delay to allow modal close animation
    setTimeout(() => setSelectedTicket(null), 200);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-24 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="border-b border-neutral-900 pb-10 sm:pb-12 lg:pb-14"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-neutral-500">
                16 January • Invitation-Only Afterparty
              </p>
              <h1
                id="hero-heading"
                className="text-balance text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl"
              >
                Luxe Legacy Show – Afterparty
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
                A private, post-show gathering for the city&apos;s most
                discerning guests. Curated sound, elevated service and a
                strictly limited guest list.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-neutral-300">
                <p>
                  <span className="text-neutral-100">Venue:</span> Details
                  shared post-booking
                </p>
              
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <a
                  href="#tickets"
                  className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold tracking-wide text-neutral-950 shadow-sm transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Buy Tickets
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Reserve a Table via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tickets */}
        <section
          id="tickets"
          aria-labelledby="tickets-heading"
          className="py-10 sm:py-12 lg:py-14"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Tickets
              </p>
              <h2
                id="tickets-heading"
                className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl"
              >
                Choose your entry for the afterparty
              </h2>
              <p className="max-w-xl text-sm text-neutral-300">
                All tickets include complimentary food and hosted service.
                Limited inventory for each category.
              </p>
            </div>
            <p className="text-xs text-neutral-500">
              Taxes extra as applicable • Government ID mandatory at entry
            </p>
          </div>

          <div className="mt-7 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:gap-6">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onProceed={handleProceedWithUpi}
              />
            ))}
          </div>
        </section>

        {/* How entry works */}
        <section
          aria-labelledby="entry-flow-heading"
          className="border-y border-neutral-900 py-10 sm:py-12 lg:py-14"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Entry Flow
              </p>
              <h2
                id="entry-flow-heading"
                className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl"
              >
                How entry works
              </h2>
              <p className="max-w-xl text-sm text-neutral-300">
                A seamless, digital-first experience designed for security and
                discretion.
              </p>
            </div>

            <ol className="grid gap-4 text-sm text-neutral-200 sm:grid-cols-3 sm:gap-6">
              <li className="rounded-2xl border border-neutral-900 bg-neutral-950/70 px-4 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
                  Step 1
                </p>
                <p className="mt-2 font-medium text-neutral-50">
                  Pay securely via UPI
                </p>
                <p className="mt-1.5 text-sm text-neutral-300">
                  Complete the payment using your preferred UPI app for the
                  selected ticket category.
                </p>
              </li>
              <li className="rounded-2xl border border-neutral-900 bg-neutral-950/70 px-4 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
                  Step 2
                </p>
                <p className="mt-2 font-medium text-neutral-50">
                  Receive QR on WhatsApp
                </p>
                <p className="mt-1.5 text-sm text-neutral-300">
                  After confirmation, your personalised QR code and booking
                  details are shared on WhatsApp.
                </p>
              </li>
              <li className="rounded-2xl border border-neutral-900 bg-neutral-950/70 px-4 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
                  Step 3
                </p>
                <p className="mt-2 font-medium text-neutral-50">
                  Scan at venue for entry
                </p>
                <p className="mt-1.5 text-sm text-neutral-300">
                  Present the QR at the entry desk for a quick scan and
                  hassle-free access to the afterparty.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Table booking helper text */}
        <section
          aria-labelledby="tables-heading"
          className="py-10 sm:py-12 lg:py-14"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Tables
              </p>
              <h2
                id="tables-heading"
                className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl"
              >
                Private table reservations
              </h2>
              <p className="max-w-xl text-sm text-neutral-300">
                For bottle service, hosted tables, or larger groups, connect
                with our concierge team directly on WhatsApp. Share your
                preferred time, group size and any special requirements.
              </p>
            </div>
            <p className="text-xs text-neutral-500">
              Tables are confirmed subject to availability and advance minimum
              spends.
            </p>
          </div>
        </section>
      </div>

      {/* Floating WhatsApp button for table booking */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp for table booking for Luxe Legacy Show – Afterparty"
        className="fixed bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:bottom-7 sm:right-7"
      >
        <span className="text-xl" aria-hidden="true">
          ⤴
        </span>
      </a>

      {/* Payment Modal */}
      <PaymentModal
        ticket={selectedTicket}
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
      />
    </main>
  );
}

