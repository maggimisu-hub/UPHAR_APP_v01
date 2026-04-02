import BrandLogo from "../../components/BrandLogo";
import Button from "../../components/Button";
import { CheckCircle2 } from "lucide-react";
import { useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-6 text-center">
      <BrandLogo className="h-14" />
      <CheckCircle2 className="h-16 w-16 text-accent" />
      <h1 className="mt-6 text-[1.375rem] font-bold leading-[1.25] text-primary">Order reserved</h1>
      <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
        Your Uphar order has been created and is ready for processing.
      </p>
      <p className="mt-3 text-sm text-primary">{id}</p>
      <div className="mt-8 flex w-full max-w-sm flex-col rounded-[28px] border border-primary/15 bg-ivory p-6 text-left">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Takeaway instructions</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-muted">Pickup Location</p>
            <p className="text-primary font-medium">Uphar Flagship Store, Delhi</p>
          </div>
          <div>
            <p className="text-muted">Timing Window</p>
            <p className="text-primary font-medium">11:00 AM - 7:00 PM (Mon-Sat)</p>
          </div>
          <div>
            <p className="text-muted">Store Contact</p>
            <p className="text-primary font-medium">+91 98765 43210</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-accent/10 px-4 py-3">
          <p className="text-xs text-accent">Note: Bring your Order ID {id} at pickup.</p>
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button href={`/order/${id}`} className="w-full">
          View order details
        </Button>
        <Button href="/shop" variant="secondary" className="w-full">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
