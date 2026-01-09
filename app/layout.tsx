import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luxe Legacy Show – Afterparty | Tickets & Tables",
  description:
    "Secure your entry to the Luxe Legacy Show – Afterparty on 16 January. Premium experiences, curated crowd, and complimentary food on all tickets.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Luxe Legacy Show – Afterparty",
    description:
      "A luxury fashion afterparty experience. Reserve your tickets and tables for 16 January.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Legacy Show – Afterparty",
    description:
      "Secure your entry to the Luxe Legacy Show – Afterparty on 16 January.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-50`}
      >
        {children}
      </body>
    </html>
  );
}
