export type Ticket = {
  id: string;
  name: string;
  priceInr: number;
  entryDetails: string;
  coverDetails: string;
  includesComplimentaryFood: boolean;
  isFree?: boolean; // For testing - free tickets skip payment
};

export const GST_RATE = 0.18;

export const tickets: Ticket[] = [
  {
    id: "free-test-entry",
    name: "Free Test Entry (1 Person) - Testing Only",
    priceInr: 0,
    entryDetails: "Free test ticket for testing the complete flow. Access for 1 guest.",
    coverDetails: "No cover amount included.",
    includesComplimentaryFood: true,
    isFree: true, // Skip payment for this ticket
  },
  {
    id: "only-entry-1",
    name: "Only Entry (1 Person)",
    priceInr: 2500,
    entryDetails: "Access for 1 guest to the Luxe Legacy Show – Afterparty.",
    coverDetails: "No cover amount included.",
    includesComplimentaryFood: true,
  },
  {
    id: "entry-cover-1-2000",
    name: "Entry + ₹2000 Cover (1 Person)",
    priceInr: 4500,
    entryDetails: "Access for 1 guest with reserved entry.",
    coverDetails: "Includes ₹2000 redeemable cover on food & beverages.",
    includesComplimentaryFood: true,
  },
  {
    id: "entry-cover-2-1000",
    name: "Entry + ₹1000 Cover (2 Persons)",
    priceInr: 7000,
    entryDetails: "Access for 2 guests with shared entry.",
    coverDetails: "Includes ₹1000 redeemable cover on food & beverages.",
    includesComplimentaryFood: true,
  },
  {
    id: "entry-cover-3-2000",
    name: "Entry + ₹2000 Cover (3 Persons)",
    priceInr: 9000,
    entryDetails: "Access for 3 guests with priority entry.",
    coverDetails: "Includes ₹2000 redeemable cover on food & beverages.",
    includesComplimentaryFood: true,
  },
];


