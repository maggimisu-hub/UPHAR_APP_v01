import Button from "../../components/Button";
import { AlertTriangle } from "lucide-react";

export default function PaymentFailed() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-6 text-center">
      <AlertTriangle className="h-16 w-16 text-accent" />
      <h1 className="mt-6 text-[1.375rem] font-bold leading-[1.25] text-primary">Something went wrong</h1>
      <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
        We could not complete your jewellery order at this step. Return to checkout or continue browsing the collection.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button href="/checkout" className="w-full">
          Retry checkout
        </Button>
        <Button href="/shop" variant="secondary" className="w-full">
          Back to shop
        </Button>
      </div>
    </div>
  );
}
