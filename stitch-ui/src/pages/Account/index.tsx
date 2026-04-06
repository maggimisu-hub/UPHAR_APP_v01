import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../lib/format";
import { getTakeawayNextAction, getTakeawayStatusLabel } from "../../lib/takeaway";

type AuthMode = "signin" | "signup" | "forgot";

export default function Account() {
  const {
    orders,
    wishlistCount,
    cartCount,
    userId,
    isUserAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshOrders,
  } = useStore();

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const handleRefreshOrders = async () => {
    setRefreshingOrders(true);
    setOrdersError(null);
    try {
      await refreshOrders();
    } catch (e) {
      setOrdersError("Failed to refresh orders. Please try again.");
    } finally {
      setRefreshingOrders(false);
    }
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

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

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const result = await signUpWithEmail(email.trim(), password);
      
      if (result.session) {
        setSuccess("Account created successfully. You are now signed in.");
      } else {
        // Success but no session (e.g. email confirmation required)
        setSuccess("Account created. Please sign in to continue.");
        setAuthMode("signin");
        setPassword(""); // Clear sensitive field
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-up failed. Please try again.";
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

  /* ─── Not signed in → show auth form ─── */
  if (!isUserAuthenticated) {
    return (
      <section className="container-shell py-16 sm:py-20">
        <SectionTitle
          eyebrow="Account"
          title={authMode === "signup" ? "Create your Uphar account." : "Sign in to your Uphar account."}
          body={authMode === "signup"
            ? "Create an account to place orders and track your jewellery purchases."
            : "Access your jewellery orders, saved pieces, and delivery addresses."}
        />

        <div className="mx-auto mt-10 max-w-md">
          {/* ─── Forgot password placeholder ─── */}
          {authMode === "forgot" ? (
            <div className="space-y-5 rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
                  Password reset
                </p>
                <h2 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary">
                  Forgot password
                </h2>
              </div>
              <div className="rounded-[16px] border border-primary/10 bg-primary/5 p-4 text-sm leading-6 text-primary">
                <p>Password reset flow will be enabled shortly.</p>
                <p className="mt-1">Contact support for now.</p>
              </div>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-sm font-medium text-accent transition-colors duration-200 hover:text-primary"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            /* ─── Sign in / Sign up form ─── */
            <form
              onSubmit={authMode === "signin" ? handleLogin : handleSignUp}
              className="space-y-5 rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
                  {authMode === "signin" ? "Welcome back" : "Get started"}
                </p>
                <h2 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary">
                  {authMode === "signin" ? "Sign in" : "Create account"}
                </h2>
              </div>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); setSuccess(null); }}
                placeholder="you@email.com"
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); setSuccess(null); }}
                placeholder={authMode === "signup" ? "At least 6 characters" : "Enter your password"}
                autoComplete={authMode === "signin" ? "current-password" : "new-password"}
              />

              {error && (
                <div className="rounded-[16px] border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-[16px] border border-accent/15 bg-accent/5 px-4 py-3 text-sm text-accent">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? (authMode === "signin" ? "Signing in…" : "Creating account…")
                  : (authMode === "signin" ? "Sign in" : "Create account")}
              </Button>

              <div className="flex items-center justify-between text-xs text-muted">
                {authMode === "signin" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="font-medium text-accent transition-colors duration-200 hover:text-primary"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-medium text-accent transition-colors duration-200 hover:text-primary"
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-medium text-accent transition-colors duration-200 hover:text-primary"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>
            </form>
          )}
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
        body="Review jewellery orders, tracking updates, and saved pieces in one calm, minimal dashboard."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Profile</p>
          <h2 className="mt-4 text-[1.375rem] font-bold leading-[1.25] text-primary">Client dashboard</h2>
          {userId && (
            <p className="mt-2 text-xs truncate text-muted">
              Signed in as {userId.slice(0, 8)}…
            </p>
          )}
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
            <p>Keep track of bridal orders, festive purchases, and delivery details for upcoming occasions.</p>
          </div>
          <div className="mt-8 grid gap-4 text-center text-sm grid-cols-1 md:grid-cols-2">
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{orders.length}</p>
              <p className="mt-1 text-muted">Orders</p>
            </div>
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{wishlistCount + cartCount}</p>
              <p className="mt-1 text-muted">Saved pieces</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 grid-cols-1 md:grid-cols-2">
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
          <div className="mt-8 flex flex-col md:flex-row gap-3">
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.24em] text-muted">Recent orders</h3>
            <Button
              variant="secondary"
              onClick={handleRefreshOrders}
              disabled={refreshingOrders}
              className="px-4 py-2 text-xs"
            >
              {refreshingOrders ? "Refreshing..." : "Refresh status"}
            </Button>
          </div>
          {ordersError && <p className="text-sm text-accent">{ordersError}</p>}
          
          {orders.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-primary/20 bg-ivory p-8 text-center">
              <h3 className="text-[1.375rem] font-bold leading-[1.25] text-primary">No orders yet.</h3>
              <p className="mt-3 text-sm leading-7 text-muted">Place an Uphar order to see confirmation and tracking updates here.</p>
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
                    <p>Order: <span className="text-primary">{getTakeawayStatusLabel(order)}</span></p>
                    <p className="mt-1">Payment: <span className="text-primary">{order.paymentStatus}</span></p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-primary">{getTakeawayNextAction(order)}</p>
                <div className="mt-6 flex items-center justify-between border-t border-primary/15 pt-6 text-sm">
                  <span className="text-muted">Refresh after the store team updates your order.</span>
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
