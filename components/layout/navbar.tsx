"use client";

import Link from "next/link";
import { useState } from "react";

import { CartSheet } from "@/components/cart/cart-sheet";
import { Container } from "@/components/layout/container";
import { useCart } from "@/components/providers/cart-provider";
import { searchProducts } from "@/lib/product-service";

const navLinks = [
  { href: "/men", label: "Men" },
  { href: "/women", label: "Women" },
  { href: "/account", label: "Account" },
];

export function Navbar() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = searchProducts(query).slice(0, 4);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sand/80 bg-pearl/95 backdrop-blur">
        <Container className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="rounded-full border border-sand p-2 text-ink"
              aria-label="Toggle navigation"
            >
              <MenuIcon />
            </button>
          </div>

          <Link href="/" className="font-serif text-2xl tracking-[0.25em] text-ink">
            UPHAR
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-stone lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <label className="flex h-11 items-center gap-2 rounded-full border border-sand bg-white px-4 text-sm text-stone">
                <SearchIcon />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search essentials"
                  className="w-40 bg-transparent text-ink outline-none placeholder:text-stone"
                />
              </label>
              {query ? (
                <div className="absolute right-0 mt-3 w-72 rounded-[24px] border border-sand bg-pearl p-3 shadow-soft">
                  {results.length > 0 ? (
                    results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="block rounded-2xl px-3 py-3 text-sm text-ink transition hover:bg-canvas"
                        onClick={() => setQuery("")}
                      >
                        <span className="block font-medium">{product.name}</span>
                        <span className="mt-1 block text-stone">{product.category}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-sm text-stone">No styles found.</p>
                  )}
                </div>
              ) : null}
            </div>

            <Link href="/account" className="rounded-full border border-sand p-3 text-ink transition hover:bg-white" aria-label="Account">
              <UserIcon />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-sand p-3 text-ink transition hover:bg-white"
              aria-label="Cart"
            >
              <BagIcon />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-pearl">
                {itemCount}
              </span>
            </button>
          </div>
        </Container>

        {menuOpen ? (
          <div className="border-t border-sand bg-pearl lg:hidden">
            <Container className="space-y-4 py-4">
              <label className="flex h-11 items-center gap-2 rounded-full border border-sand bg-white px-4 text-sm text-stone">
                <SearchIcon />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search essentials"
                  className="w-full bg-transparent text-ink outline-none placeholder:text-stone"
                />
              </label>
              <div className="grid gap-3 text-sm text-ink">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
              {query && results.length > 0 ? (
                <div className="grid gap-2 rounded-[24px] border border-sand bg-white p-3">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="rounded-2xl px-3 py-2 text-sm text-ink transition hover:bg-canvas"
                      onClick={() => {
                        setQuery("");
                        setMenuOpen(false);
                      }}
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </Container>
          </div>
        ) : null}
      </header>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.7">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.8-3 4.1-4.5 7-4.5s5.2 1.5 7 4.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.7">
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 8a3 3 0 1 1 6 0" />
    </svg>
  );
}

