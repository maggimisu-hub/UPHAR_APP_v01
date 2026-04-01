import { PaymentScreen } from "@/components/checkout/payment-screen";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return <PaymentScreen orderId={orderId} />;
}
