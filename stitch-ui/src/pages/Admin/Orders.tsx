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
  // Default to all orders expanded so store employees immediately see fulfillment items
  const [collapsedOrderIds, setCollapsedOrderIds] = useState<Record<string, boolean>>({});

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

  const toggleCollapse = (orderId: string) => {
    setCollapsedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

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
    <div className="rounded-[28px] border border-primary/15 bg-ivory p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Store Orders</p>
          <h1 className="mt-1 text-lg font-bold text-primary">Takeaway Order Fulfillment</h1>
        </div>
        <span className="text-xs text-muted">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted">Loading orders...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-[#B76E79]">{error}</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No orders have been placed yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {orders.map((order) => {
            const actions = getAvailableActions(order);
            const isBusy = activeOrderId === order.id;
            const isCollapsed = Boolean(collapsedOrderIds[order.id]);

            const customerName =
              order.pickupContact?.name ||
              (order.customer?.email ? order.customer.email.split("@")[0] : "Customer");
            const customerPhone = order.pickupContact?.phone || "Not recorded";
            const pickupAddress = order.pickupContact
              ? `${order.pickupContact.addressLine}, ${order.pickupContact.city} ${order.pickupContact.pincode}`
              : "In-store pickup";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-primary/15 bg-background-light p-4 sm:p-5 text-sm transition"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">{order.id}</p>
                    <p className="mt-1 text-sm font-medium text-charcoal">
                      Customer: {customerName}{" "}
                      <span className="font-normal text-muted">
                        ({order.customer?.email ?? "Unknown email"})
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm border border-primary/15 bg-ivory px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-charcoal">
                      {order.status}
                    </span>
                    <span className="rounded-sm border border-accent/30 bg-ivory px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-accent">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Pickup & Contact Information Box */}
                <div className="mt-4 rounded-xl border border-primary/10 bg-ivory p-3.5 text-xs">
                  <p className="font-semibold uppercase tracking-[0.15em] text-primary">
                    Pickup Contact
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="text-muted">Phone: </span>
                      <span className="font-medium text-primary">{customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-muted">Contact Name: </span>
                      <span className="font-medium text-primary">{customerName}</span>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <span className="text-muted">Record: </span>
                      <span className="text-charcoal">{pickupAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle Details Bar */}
                <div className="mt-3 flex items-center justify-between border-t border-primary/10 pt-3 text-xs text-muted">
                  <div className="flex items-center gap-4">
                    <span>
                      Items:{" "}
                      <strong className="text-primary">
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)}
                      </strong>{" "}
                      ({order.items.length} {order.items.length === 1 ? "variant" : "variants"})
                    </span>
                    <span>
                      Total:{" "}
                      <strong className="text-primary font-semibold">
                        {formatPrice(order.totalAmount)}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(order.id)}
                    className="font-medium text-accent hover:underline"
                  >
                    {isCollapsed ? "Show Items Breakdown ▼" : "Hide Items Breakdown ▲"}
                  </button>
                </div>

                {/* Items Preparation Breakdown */}
                {!isCollapsed && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-primary/10 bg-ivory">
                    <div className="border-b border-primary/10 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
                      Items to Prepare ({order.items.length})
                    </div>
                    {order.items.length === 0 ? (
                      <p className="p-4 text-xs text-muted">No items recorded for this order.</p>
                    ) : (
                      <div className="divide-y divide-primary/10">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs"
                          >
                            <div className="min-w-[180px] flex-1">
                              <p className="font-medium text-primary">{item.productName}</p>
                              <p className="text-muted">
                                Variant / Size:{" "}
                                <span className="font-semibold text-charcoal">
                                  {item.variantName}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-muted">Qty: </span>
                              <span className="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-muted">
                                Unit: {formatPrice(item.unitPrice)}
                              </p>
                              <p className="font-semibold text-primary">
                                Total: {formatPrice(item.lineTotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fulfillment Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
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

                  <div className="text-right text-xs">
                    <span className="text-muted">Order Total: </span>
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
