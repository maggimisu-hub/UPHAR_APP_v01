import { supabase } from "../lib/supabaseClient";

export type AdminOrderActionResult = {
  order_id: string;
  status: "pending" | "ready" | "delivered" | "cancelled";
  payment_status: "pending" | "cod" | "paid" | "failed" | "unpaid";
};

export type AdminOrderPaidResult = AdminOrderActionResult & {
  payment_record_status: "pending" | "success" | "failed";
  transaction_id: string | null;
};

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrderPickupContact = {
  id?: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
};

export type AdminOrderRecord = {
  id: string;
  addressId: string | null;
  totalAmount: number;
  status: AdminOrderActionResult["status"];
  paymentStatus: AdminOrderActionResult["payment_status"];
  createdAt: string;
  customer: {
    id: string;
    email: string;
  } | null;
  items: AdminOrderItem[];
  pickupContact: AdminOrderPickupContact | null;
};

function getSingleRow<T>(data: T[] | null, fallbackMessage: string): T {
  if (!data || data.length === 0) {
    throw new Error(fallbackMessage);
  }

  return data[0];
}

export const adminOrderService = {
  async fetchAdminOrders(): Promise<AdminOrderRecord[]> {
    const { data: rawData, error } = await supabase
      .from("orders")
      .select(
        `
          *,
          user:users (
            id,
            email
          ),
          order_items (
            id,
            product_id,
            variant_id,
            quantity,
            price,
            product:products (
              name
            ),
            variant:product_variants (
              name
            )
          )
        `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`fetchAdminOrders failed: ${error.message}`);
    }

    type RawOrderItem = {
      id: string;
      product_id: string;
      variant_id: string | null;
      quantity: number;
      price: number;
      product: { name: string } | { name: string }[] | null;
      variant: { name: string } | { name: string }[] | null;
    };

    type RawOrder = {
      id: string;
      address_id?: string | null;
      total_amount: number;
      status: AdminOrderActionResult["status"];
      payment_status: AdminOrderActionResult["payment_status"];
      created_at: string;
      user: { id: string; email: string } | { id: string; email: string }[] | null;
      order_items: RawOrderItem[] | null;
    };

    const rows = (rawData as unknown as RawOrder[] | null) ?? [];

    // Extract non-null address_ids to fetch pickup contact details
    const addressIds = rows
      .map((r) => r.address_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const addressMap = new Map<string, AdminOrderPickupContact>();

    if (addressIds.length > 0) {
      const { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("id, name, phone, address_line, city, pincode")
        .in("id", addressIds);

      if (!addressesError && addressesData) {
        for (const addr of addressesData) {
          addressMap.set(addr.id, {
            id: addr.id,
            name: addr.name || "Customer",
            phone: addr.phone || "-",
            addressLine: addr.address_line || "In-store pickup",
            city: addr.city || "Patratu",
            pincode: addr.pincode || "-",
          });
        }
      }
    }

    return rows.map((order) => {
      const customerRow = Array.isArray(order.user) ? order.user[0] : order.user;
      const customer = customerRow
        ? {
            id: customerRow.id,
            email: customerRow.email,
          }
        : null;

      const items: AdminOrderItem[] = (order.order_items ?? []).map((item) => {
        const prod = Array.isArray(item.product) ? item.product[0] : item.product;
        const vari = Array.isArray(item.variant) ? item.variant[0] : item.variant;
        const productName = prod?.name ?? "Product item";
        const variantName = vari?.name ?? "Standard";
        const unitPrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const lineTotal = unitPrice * quantity;

        return {
          id: item.id,
          productId: item.product_id,
          productName,
          variantId: item.variant_id ?? null,
          variantName,
          quantity,
          unitPrice,
          lineTotal,
        };
      });

      const pickupContact = order.address_id
        ? addressMap.get(order.address_id) ?? null
        : null;

      return {
        id: order.id,
        addressId: order.address_id ?? null,
        totalAmount: Number(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        customer,
        items,
        pickupContact,
      };
    });
  },

  async markOrderReady(orderId: string): Promise<AdminOrderActionResult> {
    const { data, error } = await supabase.rpc("mark_order_ready", {
      p_order_id: orderId,
    });

    if (error) {
      throw new Error(`markOrderReady failed: ${error.message}`);
    }

    return getSingleRow<AdminOrderActionResult>(
      data,
      "markOrderReady returned no order data",
    );
  },

  async markOrderCancelled(orderId: string): Promise<AdminOrderActionResult> {
    const { data, error } = await supabase.rpc("mark_order_cancelled", {
      p_order_id: orderId,
    });

    if (error) {
      throw new Error(`markOrderCancelled failed: ${error.message}`);
    }

    return getSingleRow<AdminOrderActionResult>(
      data,
      "markOrderCancelled returned no order data",
    );
  },

  async markOrderPaidAndDelivered(
    orderId: string,
    transactionId?: string,
  ): Promise<AdminOrderPaidResult> {
    const { data, error } = await supabase.rpc(
      "mark_order_paid_and_delivered",
      {
        p_order_id: orderId,
        p_transaction_id: transactionId ?? null,
      },
    );

    if (error) {
      throw new Error(`markOrderPaidAndDelivered failed: ${error.message}`);
    }

    return getSingleRow<AdminOrderPaidResult>(
      data,
      "markOrderPaidAndDelivered returned no order data",
    );
  },
};
