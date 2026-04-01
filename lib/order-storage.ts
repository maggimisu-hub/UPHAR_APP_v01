import type { CartItem, CheckoutFormValues, Order } from "@/types/storefront";

export const ORDER_STORAGE_KEY = "uphar-orders";

export function loadOrders() {
  if (typeof window === "undefined") {
    return [] as Order[];
  }

  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(payload: {
  items: CartItem[];
  shipping: CheckoutFormValues;
  subtotal: number;
}) {
  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    items: payload.items,
    shipping: payload.shipping,
    subtotal: payload.subtotal,
    orderStatus: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
  };

  const orders = loadOrders();
  saveOrders([newOrder, ...orders]);

  return newOrder;
}

export function updateOrderStatus(orderId: string, updates: Partial<Order>) {
  const orders = loadOrders();
  const nextOrders = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          ...updates,
        }
      : order,
  );

  saveOrders(nextOrders);
  return nextOrders.find((order) => order.id === orderId);
}

export function getOrderById(orderId: string) {
  return loadOrders().find((order) => order.id === orderId);
}

