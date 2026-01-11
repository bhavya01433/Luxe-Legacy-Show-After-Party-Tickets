"use client";

import { useEffect, useState } from "react";

type ScrollToTicketProps = {
  ticketId: string;
  onScrollComplete?: () => void;
};

export function ScrollToTicket({ ticketId, onScrollComplete }: ScrollToTicketProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-scroll to ticket after a brief delay
    const timer = setTimeout(() => {
      const ticketElement = document.getElementById(`ticket-${ticketId}`);
      if (ticketElement) {
        ticketElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        
        // Hide message after scroll
        setTimeout(() => {
          setIsVisible(false);
          if (onScrollComplete) {
            onScrollComplete();
          }
        }, 2000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [ticketId, onScrollComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 animate-bounce">
      <div className="flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-900/90 px-6 py-3 backdrop-blur-sm shadow-lg">
        <span className="text-amber-300 text-xl">↓</span>
        <p className="text-sm font-medium text-amber-50">
          Scroll down to view your ticket
        </p>
      </div>
    </div>
  );
}

