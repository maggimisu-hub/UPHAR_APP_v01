import { supabase } from "../lib/supabaseClient";
import type { CartItem, CheckoutFormValues, Order } from "../types";

type OrderRow = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export async function createOrder(
  userId: string,
  addressId: string,
  paymentMethod: "cod" | "razorpay",
  items: Array<{ product_id: string; variant_id: string; quantity: number }>,
): Promise<{ orderId: string; totalAmount: number }> {
  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_payload: {
      user_id: userId,
      address_id: addressId,
      payment_method: paymentMethod,
      items,
    },
  });

  if (error) {
    throw new Error(`createOrder failed: ${error.message}`);
  }

  if (!data || Array.isArray(data) ? data.length === 0 : !data) {
    throw new Error("createOrder returned no data");
  }

  const result = Array.isArray(data) ? data[0] : data;
  return { orderId: result.order_id, totalAmount: Number(result.total_amount) };
}

export async function getCustomerOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id,user_id,total_amount,status,payment_status,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`getCustomerOrders failed: ${error.message}`);
  }

  const rows = (data as OrderRow[] | null) ?? [];

  return rows.map((row) => ({
    id: row.id,
    items: [], // Backend product linking will be added later (cart-based order items)
    shipping: {
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
    },
    subtotal: Number(row.total_amount),
    shippingCost: 0,
    total: Number(row.total_amount),
    orderStatus: row.status as "pending" | "confirmed",
    paymentStatus: row.payment_status as "unpaid" | "paid",
    createdAt: row.created_at,
  }));
}

export const orderService = {
  createOrder,
  getCustomerOrders,
};
