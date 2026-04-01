import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import SectionTitle from "../../components/SectionTitle";
import Textarea from "../../components/Textarea";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../lib/format";
import type { CheckoutFormValues } from "../../types";

const initialForm: CheckoutFormValues = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartDetailed, cartSubtotal, placeOrder } = useStore();
  const [values, setValues] = useState<CheckoutFormValues>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});

  if (cartDetailed.length === 0) {
    return <Navigate to="/cart" replace />;
  }

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      const order = await placeOrder(values);
      if (!order) {
        navigate("/payment-failed");
        return;
      }

      navigate(`/payment?orderId=${order.id}`);
    } catch (error) {
      console.error("Order placement failed", error);
      navigate("/payment-failed");
    }
  };

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Checkout"
        title="Complete your Uphar order."
        body="Enter delivery details for your jewellery shipment and continue to the secure payment step."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Delivery details</p>
            <h2 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary">Jewellery checkout</h2>
          </div>
          <Input label="Name" value={values.name} onChange={(event) => updateField("name", event.target.value)} error={errors.name} placeholder="Full name" />
          <Input label="Phone" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} error={errors.phone} placeholder="10 digit mobile number" inputMode="numeric" />
          <Textarea label="Address" value={values.address} onChange={(event) => updateField("address", event.target.value)} error={errors.address} placeholder="House number, street, area" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="City" value={values.city} onChange={(event) => updateField("city", event.target.value)} error={errors.city} placeholder="City" />
            <Input label="Pincode" value={values.pincode} onChange={(event) => updateField("pincode", event.target.value)} error={errors.pincode} placeholder="6 digit pincode" inputMode="numeric" />
          </div>
          <Button type="submit" className="w-full">
            Place jewellery order
          </Button>
        </form>

        <aside className="rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Order preview</p>
          <div className="mt-6 space-y-4">
            {cartDetailed.map((line) => (
              <div key={`${line.product.id}-${line.size}`} className="flex items-center justify-between gap-4 border-b border-primary/15 pb-4 text-sm">
                <div>
                  <p className="text-primary">{line.product.name}</p>
                  <p className="mt-1 text-muted">Fit {line.size} x {line.quantity}</p>
                </div>
                <p className="text-primary">{formatPrice(line.lineTotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-primary">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="text-primary">Complimentary</span>
            </div>
            <div className="flex items-center justify-between border-t border-primary/15 pt-4 text-base">
              <span className="text-primary">Total</span>
              <span className="font-medium text-primary">{formatPrice(cartSubtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
