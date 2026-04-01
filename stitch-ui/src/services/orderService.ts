import { supabase } from "../lib/supabaseClient";
import type { CheckoutFormValues, Order } from "../types";

type OrderRow = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    product_id: string;
    quantity: number;
    variant: { name: string } | { name: string }[] | null;
  }> | null;
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

export async function createAddressForCheckout(
  userId: string,
  shipping: CheckoutFormValues,
): Promise<string> {
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      name: shipping.name,
      phone: shipping.phone,
      address_line: shipping.address,
      city: shipping.city,
      pincode: shipping.pincode,
      is_default: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`createAddressForCheckout failed: ${error.message}`);
  }

  return data.id;
}

export async function getCustomerOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        user_id,
        total_amount,
        status,
        payment_status,
        created_at,
        order_items (
          product_id,
          quantity,
          variant:product_variants (
            name
          )
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`getCustomerOrders failed: ${error.message}`);
  }

  const rows = (data as OrderRow[] | null) ?? [];

  return rows.map((row) => ({
    id: row.id,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id,
      size: Array.isArray(item.variant)
        ? (item.variant[0]?.name ?? "Standard")
        : (item.variant?.name ?? "Standard"),
      quantity: item.quantity,
    })),
    shipping: {
      name: "Store pickup",
      phone: "-",
      address: "Collect from Uphar store after status changes to Ready",
      city: "In-store",
      pincode: "-",
    },
    subtotal: Number(row.total_amount),
    shippingCost: 0,
    total: Number(row.total_amount),
    orderStatus: row.status as Order["orderStatus"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    createdAt: row.created_at,
  }));
}

export const orderService = {
  createOrder,
  createAddressForCheckout,
  getCustomerOrders,
};
