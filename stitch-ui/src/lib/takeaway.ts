import type { Order } from "../types";

export const TAKEAWAY_STORE = {
  name: "Uphar Flagship Store",
  city: "Delhi",
  phone: "+91 98765 43210",
  pickupWindow: "11:00 AM - 7:00 PM (Mon-Sat)",
};

export function getTakeawayStatusLabel(order: Order): string {
  if (order.orderStatus === "cancelled") {
    return "Cancelled";
  }

  if (order.orderStatus === "delivered" && order.paymentStatus === "paid") {
    return "Completed";
  }

  if (order.orderStatus === "ready") {
    return "Ready for pickup";
  }

  return "Preparing your order";
}

export function getTakeawayStatusMessage(order: Order): string {
  if (order.orderStatus === "cancelled") {
    return "This order was cancelled. Contact the store if you need help.";
  }

  if (order.orderStatus === "delivered" && order.paymentStatus === "paid") {
    return "Your store pickup is complete and payment has been received.";
  }

  if (order.orderStatus === "ready") {
    return `Your order is ready. Visit ${TAKEAWAY_STORE.name}, ${TAKEAWAY_STORE.city} during pickup hours and pay at the store.`;
  }

  return "Do not visit the store yet. The team is preparing your order and will move it to ready for pickup once it is set aside.";
}

export function getTakeawayNextAction(order: Order): string {
  if (order.orderStatus === "cancelled") {
    return "No further action required";
  }

  if (order.orderStatus === "delivered" && order.paymentStatus === "paid") {
    return "Order collected and paid";
  }

  if (order.orderStatus === "ready") {
    return `Come to the store during ${TAKEAWAY_STORE.pickupWindow} and bring your order ID`;
  }

  return "Wait for the order to move to Ready for pickup";
}
