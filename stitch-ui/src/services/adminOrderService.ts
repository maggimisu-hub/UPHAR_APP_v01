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

type AdminOrderUserRow = {
  id: string;
  email: string;
};

type AdminOrderRow = {
  id: string;
  total_amount: number;
  status: AdminOrderActionResult["status"];
  payment_status: AdminOrderActionResult["payment_status"];
  created_at: string;
  user: AdminOrderUserRow | AdminOrderUserRow[] | null;
};

export type AdminOrderRecord = {
  id: string;
  totalAmount: number;
  status: AdminOrderActionResult["status"];
  paymentStatus: AdminOrderActionResult["payment_status"];
  createdAt: string;
  customer: {
    id: string;
    email: string;
  } | null;
};

function getSingleRow<T>(data: T[] | null, fallbackMessage: string): T {
  if (!data || data.length === 0) {
    throw new Error(fallbackMessage);
  }

  return data[0];
}

export const adminOrderService = {
  async fetchAdminOrders(): Promise<AdminOrderRecord[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
          id,
          total_amount,
          status,
          payment_status,
          created_at,
          user:users (
            id,
            email
          )
        `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`fetchAdminOrders failed: ${error.message}`);
    }

    return ((data as AdminOrderRow[] | null) ?? []).map((order) => {
      const customer = Array.isArray(order.user) ? order.user[0] : order.user;

      return {
        id: order.id,
        totalAmount: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        customer: customer
          ? {
              id: customer.id,
              email: customer.email,
            }
          : null,
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
