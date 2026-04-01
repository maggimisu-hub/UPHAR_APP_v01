import { Outlet, NavLink } from "react-router-dom";

const links = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background-light px-5 py-6">
      <h1 className="text-[1.375rem] font-bold leading-[1.25] text-primary">Admin</h1>
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
