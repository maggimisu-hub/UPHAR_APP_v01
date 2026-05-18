import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../lib/format";
import { getTakeawayNextAction, getTakeawayStatusLabel } from "../../lib/takeaway";

type AuthMode = "signin" | "signup" | "forgot";
type LoginMethod = "password" | "otp";

export default function Account() {
  const {
    orders,
    wishlistCount,
    cartCount,
    userId,
    isUserAuthenticated,
    signInWithEmail,
    sendEmailOtp,
    verifyEmailOtp,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
    refreshOrders,
  } = useStore();

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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
    } catch {
      setOrdersError("Failed to refresh orders. Please try again.");
    } finally {
      setRefreshingOrders(false);
    }
  };

  const resetAuthMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetAuthMessages();
    setOtpSent(false);
    setOtp("");
  };

  const switchLoginMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    resetAuthMessages();
    setOtpSent(false);
    setOtp("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetAuthMessages();

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
    resetAuthMessages();

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
        setSuccess("Account created. Please sign in to continue.");
        setAuthMode("signin");
        setLoginMethod("password");
        setPassword("");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-up failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetAuthMessages();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await sendEmailOtp(email.trim());
      setOtpSent(true);
      setSuccess("OTP sent. Check your email and enter the code here.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not send OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetAuthMessages();

    if (!email.trim() || !otp.trim()) {
      setError("Please enter your email and OTP.");
      return;
    }

    try {
      setLoading(true);
      await verifyEmailOtp(email.trim(), otp.trim());
      setSuccess("Signed in successfully.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired OTP. Please request a new code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetAuthMessages();

    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Ignore sign-out errors.
    }
  };

  if (!isUserAuthenticated) {
    const isPasswordMode = authMode === "signin" && loginMethod === "password";
    const isOtpMode = authMode === "signin" && loginMethod === "otp";

    return (
      <section className="min-h-[calc(100vh-96px)] bg-[radial-gradient(circle_at_top,_rgba(190,108,124,0.16),_transparent_34%),linear-gradient(135deg,_#003f39_0%,_#06251f_52%,_#021815_100%)] px-5 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden text-ivory lg:block">
            <p className="text-[11px] uppercase tracking-[0.36em] text-accent">Uphar access</p>
            <h1 className="mt-5 font-display text-5xl leading-tight">Secure access for orders and admin.</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-ivory/75">
              Sign in with password, email OTP, or Google. Admin access still depends on the verified admin role.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[28px] border border-ivory/10 bg-ivory/95 p-6 shadow-2xl shadow-black/25 backdrop-blur sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary text-accent">
                <ShieldCheck size={26} strokeWidth={1.8} />
              </div>
              <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-muted">Secure login</p>
              <h2 className="mt-3 text-[1.625rem] font-bold leading-[1.2] text-primary">
                {authMode === "signup" ? "Create your Uphar account." : "Sign in to Uphar."}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Access orders, saved pieces, checkout, and admin tools if your account has admin permission.
              </p>
            </div>

            {authMode === "forgot" ? (
              <div className="mt-7 space-y-5">
                <div className="rounded-[16px] border border-primary/10 bg-primary/5 p-4 text-sm leading-6 text-primary">
                  <p>Password reset is still handled by support for now.</p>
                  <p className="mt-1">Use Email OTP if you need password-free access.</p>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-sm font-medium text-accent transition-colors duration-200 hover:text-primary"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <div className="mt-7 space-y-5">
                {authMode === "signin" && (
                  <div className="grid grid-cols-2 rounded-sm border border-primary/10 bg-background-light p-1">
                    <button
                      type="button"
                      onClick={() => switchLoginMethod("password")}
                      className={`flex items-center justify-center gap-2 rounded-sm px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                        loginMethod === "password"
                          ? "bg-primary text-ivory"
                          : "text-muted hover:text-primary"
                      }`}
                    >
                      <LockKeyhole size={15} />
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => switchLoginMethod("otp")}
                      className={`flex items-center justify-center gap-2 rounded-sm px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                        loginMethod === "otp"
                          ? "bg-primary text-ivory"
                          : "text-muted hover:text-primary"
                      }`}
                    >
                      <KeyRound size={15} />
                      Email OTP
                    </button>
                  </div>
                )}

                {isPasswordMode && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        resetAuthMessages();
                      }}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />

                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        resetAuthMessages();
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-medium text-accent transition-colors duration-200 hover:text-primary"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Login"}
                    </Button>
                  </form>
                )}

                {isOtpMode && (
                  <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        resetAuthMessages();
                      }}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />

                    {otpSent && (
                      <Input
                        label="OTP code"
                        type="text"
                        value={otp}
                        onChange={(event) => {
                          setOtp(event.target.value);
                          resetAuthMessages();
                        }}
                        placeholder="Enter code from email"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
                    </Button>

                    {otpSent && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          resetAuthMessages();
                        }}
                        className="w-full text-center text-xs font-medium text-accent transition-colors duration-200 hover:text-primary"
                      >
                        Use a different email or request a new code
                      </button>
                    )}
                  </form>
                )}

                {authMode === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        resetAuthMessages();
                      }}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />

                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        resetAuthMessages();
                      }}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                )}

                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-muted/70">
                  <span className="h-px flex-1 bg-primary/10" />
                  or
                  <span className="h-px flex-1 bg-primary/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-between rounded-sm border border-primary/15 bg-ivory px-4 text-left text-sm font-semibold text-primary transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-light font-bold text-accent">
                      G
                    </span>
                    Continue with Google
                  </span>
                  <Mail size={16} className="text-muted" />
                </button>

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

                <div className="flex items-center justify-between text-xs text-muted">
                  {authMode === "signin" ? (
                    <>
                      <span>New user?</span>
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
                      onClick={() => {
                        switchMode("signin");
                        switchLoginMethod("password");
                      }}
                      className="font-medium text-accent transition-colors duration-200 hover:text-primary"
                    >
                      Already have an account? Sign in
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Account</p>
        <h1 className="mt-4 font-display text-4xl text-primary">Your Uphar account.</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Review jewellery orders, tracking updates, and saved pieces in one calm, minimal dashboard.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Profile</p>
          <h2 className="mt-4 text-[1.375rem] font-bold leading-[1.25] text-primary">Client dashboard</h2>
          {userId && (
            <p className="mt-2 truncate text-xs text-muted">
              Signed in as {userId.slice(0, 8)}...
            </p>
          )}
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
            <p>Keep track of bridal orders, festive purchases, and delivery details for upcoming occasions.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 text-center text-sm md:grid-cols-2">
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{orders.length}</p>
              <p className="mt-1 text-muted">Orders</p>
            </div>
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{wishlistCount + cartCount}</p>
              <p className="mt-1 text-muted">Saved pieces</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
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
          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Button href="/shop" className="flex-1">
              Shop collection
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleSignOut}>
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
