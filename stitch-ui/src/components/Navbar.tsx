import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import BrandLogo from "./BrandLogo";
import { useStore } from "../context/StoreContext";
import { formatCollection } from "../lib/format";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/men", label: "Bridal" },
  { to: "/women", label: "Festive" },
  { to: "/shop", label: "Jewellery" },
];

export default function Navbar() {
  const location = useLocation();
  const { cartCount, wishlistCount, searchProducts } = useStore();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchProducts(query).slice(0, 4), [query, searchProducts]);

  return (
    <header className="sticky top-0 z-50 border-b border-accent/30 bg-primary">
      <div className="container-shell flex min-h-20 items-center justify-between gap-4 py-4">
        <Link to="/" className="shrink-0" aria-label="Uphar home">
          <BrandLogo className="h-11" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-ivory/80 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "text-accent" : "hover:text-accent"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <label className="flex items-center gap-2 rounded-sm border border-accent/30 bg-ivory px-4 py-3 text-sm text-charcoal">
              <Search className="h-4 w-4 text-primary" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search jewellery"
                className="w-40 bg-transparent outline-none"
              />
            </label>
            {query ? (
              <div className="absolute right-0 mt-3 w-72 rounded-sm border border-primary/15 bg-ivory p-3">
                {results.length > 0 ? (
                  results.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => setQuery("")}
                      className="block rounded-sm px-3 py-3 text-sm text-charcoal transition duration-300 hover:bg-background-light hover:text-accent"
                    >
                      <span className="block font-serif text-primary">{product.name}</span>
                      <span className="mt-1 block text-charcoal/70">{formatCollection(product.category)}</span>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-3 text-sm text-charcoal/70">No results found.</p>
                )}
              </div>
            ) : null}
          </div>

          <Link
            to="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#B76E79] transition-colors duration-200 hover:text-white"
          >
            <Heart className="h-4 w-4 text-[#B76E79]" />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-sm bg-accent px-1 text-[10px] text-ivory">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <Link
            to="/account"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#B76E79] transition-colors duration-200 hover:text-white"
          >
            <User className="h-4 w-4 text-[#B76E79]" />
          </Link>
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#B76E79] transition-colors duration-200 hover:text-white"
          >
            <ShoppingBag className="h-4 w-4 text-[#B76E79]" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-sm bg-accent px-1 text-[10px] text-ivory">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="border-t border-accent/30 md:hidden">
        <div className="container-shell flex gap-5 overflow-x-auto py-3 text-sm text-ivory/80 no-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap ${location.pathname === link.to ? "text-accent" : "hover:text-accent"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
