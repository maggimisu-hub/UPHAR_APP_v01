import Link from "next/link";

import { Container } from "@/components/layout/container";

const footerColumns = [
  {
    title: "About",
    links: [
      { label: "Brand story", href: "/" },
      { label: "Craft & quality", href: "/" },
      { label: "Journal", href: "/" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "support@uphar.com", href: "mailto:support@uphar.com" },
      { label: "+91 98765 43210", href: "tel:+919876543210" },
      { label: "Client services", href: "/account" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping", href: "/checkout" },
      { label: "Returns", href: "/account" },
      { label: "Privacy", href: "/account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-sand bg-ink text-pearl">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-pearl/60">UPHAR</p>
          <h2 className="mt-4 font-serif text-3xl">Elevated essentials for a quiet, premium wardrobe.</h2>
          <p className="mt-4 text-sm leading-7 text-pearl/70">
            Built to scale with modern commerce, designed to feel refined on every screen.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs uppercase tracking-[0.28em] text-pearl/50">{column.title}</h3>
            <div className="mt-5 grid gap-3 text-sm text-pearl/80">
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-pearl">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </Container>
    </footer>
  );
}

