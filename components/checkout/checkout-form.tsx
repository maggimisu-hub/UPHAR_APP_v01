"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/forms/button";
import { Input } from "@/components/forms/input";
import { Textarea } from "@/components/forms/textarea";
import { useCart } from "@/components/providers/cart-provider";
import { createOrder } from "@/lib/order-storage";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/types/storefront";

const initialForm: CheckoutFormValues = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, lines, subtotal } = useCart();
  const [values, setValues] = useState<CheckoutFormValues>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof CheckoutFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!/^\d{10}$/.test(values.phone.trim())) nextErrors.phone = "Enter a valid 10 digit phone number.";
    if (!values.address.trim()) nextErrors.address = "Address is required.";
    if (!values.city.trim()) nextErrors.city = "City is required.";
    if (!/^\d{6}$/.test(values.pincode.trim())) nextErrors.pincode = "Enter a valid 6 digit pincode.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (lines.length === 0 || !validate()) {
      return;
    }

    setIsSubmitting(true);
    const order = createOrder({
      items,
      shipping: values,
      subtotal,
    });

    router.push(`/payment?orderId=${order.id}`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[32px] border border-sand bg-white p-6 shadow-soft sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone">Shipping details</p>
          <h2 className="mt-3 font-serif text-3xl text-ink">Secure checkout</h2>
        </div>
        <Input label="Name" value={values.name} onChange={(event) => updateField("name", event.target.value)} error={errors.name} placeholder="Full name" />
        <Input label="Phone" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} error={errors.phone} placeholder="10 digit mobile number" inputMode="numeric" />
        <Textarea label="Address" value={values.address} onChange={(event) => updateField("address", event.target.value)} error={errors.address} placeholder="House number, street, area" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="City" value={values.city} onChange={(event) => updateField("city", event.target.value)} error={errors.city} placeholder="City" />
          <Input label="Pincode" value={values.pincode} onChange={(event) => updateField("pincode", event.target.value)} error={errors.pincode} placeholder="6 digit pincode" inputMode="numeric" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || lines.length === 0}>
          {isSubmitting ? "Redirecting..." : "Place order"}
        </Button>
      </form>

      <aside className="rounded-[32px] border border-sand bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone">Order preview</p>
        <div className="mt-6 space-y-4">
          {lines.map((line) => (
            <div key={`${line.product.id}-${line.size}`} className="flex items-center justify-between gap-4 border-b border-sand pb-4 text-sm">
              <div>
                <p className="text-ink">{line.product.name}</p>
                <p className="mt-1 text-stone">{line.size} x {line.quantity}</p>
              </div>
              <p className="text-ink">{formatPrice(line.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 text-sm text-stone">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="text-ink">Complimentary</span>
          </div>
          <div className="flex items-center justify-between border-t border-sand pt-4 text-base">
            <span className="text-ink">Total</span>
            <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

