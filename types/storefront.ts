export type Category = "men" | "women";

export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: Category;
  sizes: string[];
  description: string;
  tag: string;
  featured?: boolean;
  newArrival?: boolean;
};

export type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};

export type CartLine = {
  product: Product;
  size: string;
  quantity: number;
  lineTotal: number;
};

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export type OrderStatus = "pending" | "confirmed";
export type PaymentStatus = "unpaid" | "paid";

export type Order = {
  id: string;
  items: CartItem[];
  shipping: CheckoutFormValues;
  subtotal: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  quote: string;
};

