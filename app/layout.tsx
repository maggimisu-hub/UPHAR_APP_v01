import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CartProvider } from "@/components/providers/cart-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "UPHAR | Premium Fashion",
  description: "A premium, scalable ecommerce storefront built with Next.js App Router.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}

