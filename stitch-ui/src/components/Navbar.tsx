import { Heart, LogOut, Search, ShoppingBag, User, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import BrandLogo from "./BrandLogo";
import { useStore } from "../context/StoreContext";
import { formatTaxonomy } from "../lib/format";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collection/bridal", label: "Bridal" },
  { to: "/collection/festive", label: "Festive" },
  { to: "/type/jewellery", label: "Jewellery" },
  { to: "/type/bangles", label: "Bangles" },
  { to: "/type/cosmetics", label: "Cosmetics" },
];

export default function Navbar() {
  const location = useLocation();
  const { authLoading, cartCount, isUserAuthenticated, signOut, wishlistCount, searchProducts, isAdmin } = useStore();
  const [query, setQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const results = useMemo(() => searchProducts(query).slice(0, 4), [query, searchProducts]);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      await signOut();
      setAccountMenuOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

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
                      <span className="mt-1 block text-charcoal/70">{formatTaxonomy(product.product_type)}</span>
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
          <div ref={accountMenuRef} className="relative">
            {isUserAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((current) => !current)}
                  disabled={authLoading}
                  aria-expanded={accountMenuOpen}
                  aria-label="Account menu"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#B76E79] transition-colors duration-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <User className="h-4 w-4 text-[#B76E79]" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-sm border border-primary/15 bg-ivory p-2 text-sm shadow-xl shadow-black/15">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 rounded-sm px-3 py-3 text-primary transition hover:bg-background-light hover:text-accent"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="flex items-center gap-3 rounded-sm px-3 py-3 text-primary transition hover:bg-background-light hover:text-accent"
                    >
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left text-primary transition hover:bg-background-light hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/account"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#B76E79] transition-colors duration-200 hover:text-white"
                aria-label="Account"
              >
                <User className="h-4 w-4 text-[#B76E79]" />
              </Link>
            )}
          </div>
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
