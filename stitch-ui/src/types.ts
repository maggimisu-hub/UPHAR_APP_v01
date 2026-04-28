export type ProductType = "jewellery" | "bangles" | "cosmetics";
export type ProductCollection = "none" | "bridal" | "festive";

export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  media?: Array<{
    url: string;
    isVideo: boolean;
    displayOrder: number;
  }>;
  product_type: ProductType;
  product_collection: ProductCollection;
  is_returnable: boolean;
  return_policy_note?: string;
  sizes: string[];
  description: string;
  tag: string;
  variantStock?: Record<string, number>;
  featured?: boolean;
  newArrival?: boolean;
};

export type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type OrderStatus = "confirmed" | "processing" | "delivered";
export type PaymentStatus = "unpaid" | "paid" | "pending" | "cod" | "failed";

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  shipping: CheckoutFormValues;
  subtotal: number;
  shippingCost: number;
  total: number;
  orderStatus: "pending" | "confirmed" | "ready" | "delivered" | "cancelled";
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  quote: string;
};
