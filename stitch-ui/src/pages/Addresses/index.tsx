import { useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";

export default function Addresses() {
  const { addresses, addAddress } = useStore();
  const [form, setForm] = useState({
    label: "Studio",
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: true,
  });

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Contact"
        title="Saved contact details."
        body="Store contact details to quickly identify your orders for in-store pickup. These locally saved contacts are optional; checkout always collects and confirms your contact details for each order."
      />

      <div className="mt-10 space-y-4">
        {addresses.map((address) => (
          <article key={address.id} className="rounded-[28px] border border-primary/15 bg-ivory p-5 text-sm text-muted">
            <p className="text-primary">{address.label}</p>
            <p className="mt-2">{address.name}</p>
            <p>{address.line1}, {address.city}, {address.state} {address.pincode}</p>
            <p>{address.phone}</p>
          </article>
        ))}
      </div>

      <form
        className="mt-8 rounded-[28px] border border-primary/15 bg-ivory p-5"
        onSubmit={(event) => {
          event.preventDefault();
          addAddress(form);
          setForm({
            label: "Studio",
            name: "",
            phone: "",
            line1: "",
            city: "",
            state: "",
            pincode: "",
            isDefault: true,
          });
        }}
      >
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Add contact details</p>
        <div className="mt-4 grid gap-3">
          <Input label="Label" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
          <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <Input label="Contact Address / ID Record" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
            <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
            <Input label="Pincode" value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} />
          </div>
        </div>
        <Button className="mt-4">Save contact details</Button>
      </form>
    </section>
  );
}
