import { PaymentReturnScreen } from "@/components/checkout/payment-return-screen";

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return <PaymentReturnScreen orderId={orderId} />;
}
