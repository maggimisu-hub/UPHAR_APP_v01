import { useEffect, useState } from "react";

import Button from "../../components/Button";
import { formatDate, formatPrice } from "../../lib/format";
import {
  adminOrderService,
  type AdminOrderActionResult,
  type AdminOrderPaidResult,
  type AdminOrderRecord,
} from "../../services/adminOrderService";

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const nextOrders = await adminOrderService.fetchAdminOrders();
        if (!ignore) {
          setOrders(nextOrders);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load admin orders.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const applyOrderUpdate = (
    orderId: string,
    result: AdminOrderActionResult | AdminOrderPaidResult,
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: result.status,
              paymentStatus: result.payment_status,
            }
          : order,
      ),
    );
  };

  const runAction = async (
    orderId: string,
    action: () => Promise<AdminOrderActionResult | AdminOrderPaidResult>,
  ) => {
    try {
      setActiveOrderId(orderId);
      setError(null);

      const result = await action();
      applyOrderUpdate(orderId, result);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Failed to update order.",
      );
    } finally {
      setActiveOrderId(null);
    }
  };

  const getAvailableActions = (order: AdminOrderRecord) => {
    if (order.status === "pending" && order.paymentStatus === "cod") {
      return {
        canMarkReady: true,
        canCancel: true,
        canComplete: false,
      };
    }

    if (order.status === "ready" && order.paymentStatus === "cod") {
      return {
        canMarkReady: false,
        canCancel: true,
        canComplete: true,
      };
    }

    return {
      canMarkReady: false,
      canCancel: false,
      canComplete: false,
    };
  };

  return (
    <div className="rounded-[28px] border border-primary/15 bg-ivory p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Orders</p>
      {loading ? (
        <p className="mt-4 text-sm text-muted">Loading orders...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-[#B76E79]">{error}</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No orders have been placed yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const actions = getAvailableActions(order);
            const isBusy = activeOrderId === order.id;

            return (
              <div
                key={order.id}
                className="border-b border-primary/10 pb-4 text-sm last:border-b-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-primary">{order.id}</p>
                    <p className="mt-1 text-muted">{order.customer?.email ?? "Unknown customer"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm border border-primary/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-charcoal">
                      {order.status}
                    </span>
                    <span className="rounded-sm border border-accent/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-accent">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-muted">
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {actions.canMarkReady ? (
                    <Button
                      type="button"
                      className="px-4 py-2 text-xs"
                      disabled={isBusy}
                      onClick={() =>
                        void runAction(order.id, () => adminOrderService.markOrderReady(order.id))
                      }
                    >
                      {isBusy ? "Updating..." : "Mark Ready"}
                    </Button>
                  ) : null}

                  {actions.canComplete ? (
                    <Button
                      type="button"
                      className="px-4 py-2 text-xs"
                      disabled={isBusy}
                      onClick={() =>
                        void runAction(order.id, () =>
                          adminOrderService.markOrderPaidAndDelivered(order.id),
                        )
                      }
                    >
                      {isBusy ? "Updating..." : "Mark Paid & Delivered"}
                    </Button>
                  ) : null}

                  {actions.canCancel ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-4 py-2 text-xs"
                      disabled={isBusy}
                      onClick={() =>
                        void runAction(order.id, () =>
                          adminOrderService.markOrderCancelled(order.id),
                        )
                      }
                    >
                      {isBusy ? "Updating..." : "Cancel Order"}
                    </Button>
                  ) : null}

                  {!actions.canMarkReady && !actions.canComplete && !actions.canCancel ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-muted">
                      {order.status === "delivered" && order.paymentStatus === "paid"
                        ? "Completed"
                        : order.status === "cancelled"
                          ? "Cancelled"
                          : "No actions available"}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
