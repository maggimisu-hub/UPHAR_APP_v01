import { Link } from "react-router-dom";

const columns = [
  {
    title: "About",
    links: [
      { label: "Brand story", to: "/" },
      { label: "Craft & quality", to: "/" },
      { label: "Jewellery Concierge", to: "/stylist" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "support@uphar.com", to: "/account" },
      { label: "Client services", to: "/account" },
      { label: "Address book", to: "/addresses" },
      { label: "Wishlist", to: "/wishlist" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping", to: "/checkout" },
      { label: "Returns", to: "/account" },
      { label: "Privacy", to: "/account" },
      { label: "Virtual preview", to: "/try-on" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Account", to: "/account" },
      { label: "Saved pieces", to: "/wishlist" },
      { label: "Try-on", to: "/try-on" },
      { label: "Admin", to: "/admin" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-primary text-ivory">
      <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Uphar</p>
          <h2 className="mt-4 font-display text-3xl">The Signature of Style</h2>
          <p className="mt-4 text-sm leading-7 text-ivory/80">
            Premium Indian jewellery presented with restraint, clarity, and a refined sense of occasion.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-accent">{column.title}</h3>
            <div className="mt-5 grid gap-3 text-sm text-ivory/80">
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className="hover:text-accent">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
