import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../lib/format";

export default function Account() {
  const {
    orders,
    wishlistCount,
    cartCount,
    userId,
    isUserAuthenticated,
    signInWithEmail,
    signOut,
  } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Ignore sign-out errors
    }
  };

  /* ─── Not signed in → show login form ─── */
  if (!isUserAuthenticated) {
    return (
      <section className="container-shell py-16 sm:py-20">
        <SectionTitle
          eyebrow="Account"
          title="Sign in to your Uphar account."
          body="Access your jewellery orders, saved pieces, and delivery addresses."
        />

        <div className="mx-auto mt-10 max-w-md">
          <form
            onSubmit={handleLogin}
            className="space-y-5 rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Welcome back
              </p>
              <h2 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary">
                Sign in
              </h2>
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-center text-xs text-muted">
              Use your Uphar account credentials to continue.
            </p>
          </form>
        </div>
      </section>
    );
  }

  /* ─── Signed in → show dashboard ─── */
  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Account"
        title="Your Uphar account."
        body="Review jewellery orders, payment updates, and saved pieces in one calm, minimal dashboard."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Profile</p>
          <h2 className="mt-4 text-[1.375rem] font-bold leading-[1.25] text-primary">Client dashboard</h2>
          {userId && (
            <p className="mt-2 text-xs text-muted truncate">
              Signed in as {userId.slice(0, 8)}…
            </p>
          )}
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
            <p>Keep track of bridal orders, festive purchases, and delivery details for upcoming occasions.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm">
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{orders.length}</p>
              <p className="mt-1 text-muted">Orders</p>
            </div>
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{wishlistCount + cartCount}</p>
              <p className="mt-1 text-muted">Saved pieces</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link to="/wishlist" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Saved pieces
            </Link>
            <Link to="/addresses" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Address book
            </Link>
            <Link to="/stylist" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Jewellery concierge
            </Link>
            <Link to="/try-on" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Virtual preview
            </Link>
          </div>
          <div className="mt-8 flex gap-3">
            <Button href="/shop" className="flex-1">
              Shop collection
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-primary/20 bg-ivory p-8 text-center">
              <h3 className="text-[1.375rem] font-bold leading-[1.25] text-primary">No orders yet.</h3>
              <p className="mt-3 text-sm leading-7 text-muted">Place an Uphar order to see confirmation and payment updates here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <Link key={order.id} to={`/order/${order.id}`} className="block rounded-[32px] border border-primary/15 bg-ivory p-6 transition duration-300 hover:border-accent sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{order.id}</p>
                    <h3 className="mt-3 text-[18px] font-semibold leading-[1.3] text-primary">Order placed {formatDate(order.createdAt)}</h3>
                  </div>
                  <div className="text-right text-sm text-muted">
                    <p>Order: <span className="text-primary">{order.orderStatus}</span></p>
                    <p className="mt-1">Payment: <span className="text-primary">{order.paymentStatus}</span></p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-primary/15 pt-6 text-sm">
                  <span className="text-muted">Shipping to {order.shipping.city}</span>
                  <span className="font-medium text-primary">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
