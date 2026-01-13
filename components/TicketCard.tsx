import type { Ticket } from "@/config/tickets";
import { GST_RATE } from "@/config/tickets";
import { buildWhatsAppLink } from "@/lib/whatsapp-booking";

type TicketCardProps = {
  ticket: Ticket;
};

const formatCurrencyInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function TicketCard({ ticket }: TicketCardProps) {
  const gstAmount = ticket.priceInr * GST_RATE;
  const totalWithGst = ticket.priceInr + gstAmount;
  const whatsappUrl = buildWhatsAppLink(ticket);

  return (
    <article
      className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950/60 px-5 py-6 shadow-[0_1px_0_rgba(255,255,255,0.03)] outline-none ring-0 transition hover:border-neutral-700 hover:bg-neutral-900/70 focus-within:border-neutral-500"
      aria-label={ticket.name}
    >
      <div className="space-y-4">
        <header className="space-y-1.5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Ticket
          </p>
          <h3 className="text-lg font-semibold text-neutral-50">
            {ticket.name}
          </h3>
        </header>

        <div className="space-y-1.5">
          <p className="text-2xl font-semibold text-amber-300">
            {formatCurrencyInr(ticket.priceInr)}
          </p>
          <p className="text-xs text-neutral-400">
            Price + 18% GST 
           
          </p>
        </div>

        <dl className="space-y-2 text-sm text-neutral-300">
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              Entry
            </dt>
            <dd>{ticket.entryDetails}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              Cover
            </dt>
            <dd>{ticket.coverDetails}</dd>
          </div>
          {ticket.includesComplimentaryFood && (
            <div>
              <dt className="sr-only">Food</dt>
              <dd className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                Complimentary food included
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-5 pt-4 border-t border-neutral-800">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-4 py-2.5 text-sm font-semibold tracking-wide text-neutral-950 shadow-sm transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          aria-label={`Book ${ticket.name} via WhatsApp`}
          data-ticket-id={ticket.id}
          data-ticket-price={ticket.priceInr}
        >
          Book via WhatsApp
        </a>
      </div>
    </article>
  );
}


