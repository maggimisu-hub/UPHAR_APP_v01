import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { getCurrentUser } from "../../services/authService";

const links = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/hero", label: "Hero" },
  { to: "/admin/voice-training", label: "Voice Training" },
];

export default function AdminLayout() {
  const { isUserAuthenticated, authLoading } = useStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    setRoleLoading(true);

    if (!isUserAuthenticated) {
      setIsAdmin(false);
      setRoleLoading(false);
      return () => {
        cancelled = true;
      };
    }

    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setIsAdmin(user?.role === "admin");
        setRoleLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsAdmin(false);
        setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isUserAuthenticated, authLoading]);

  if (authLoading || roleLoading) {
    return null;
  }

  if (!isUserAuthenticated || !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="min-h-screen bg-background-light px-5 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[1.375rem] font-bold leading-[1.25] text-primary">Admin</h1>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-ivory px-3.5 py-1.5 text-xs text-primary hover:border-accent hover:text-accent transition duration-300 shadow-sm"
        >
          <span>View Storefront</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="mt-6 flex gap-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-sm px-4 py-3 text-xs uppercase tracking-[0.24em] transition duration-300 ${
                isActive ? "bg-accent text-ivory" : "border border-primary/15 bg-ivory text-primary hover:border-accent"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
