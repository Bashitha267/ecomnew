import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "../context/CurrencyContext";
import { StoreProvider } from "../context/StoreContext";

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
        <StoreProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
