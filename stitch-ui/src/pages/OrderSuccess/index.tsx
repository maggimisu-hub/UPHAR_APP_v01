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
        Your Uphar order has been created and is ready for payment confirmation.
      </p>
      <p className="mt-3 text-sm text-primary">{id}</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button href={`/payment?orderId=${id}`} className="w-full">
          Go to payment
        </Button>
        <Button href="/shop" variant="secondary" className="w-full">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
