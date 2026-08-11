import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "../context/CurrencyContext";

export const metadata: Metadata = {
  title: "CARLTON VALLEY | High Fashion & Contemporary Wear",
  description: "Luxury apparel & contemporary fashion store. Explore our seasonal drops in AUD and LKR.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-black antialiased">
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
