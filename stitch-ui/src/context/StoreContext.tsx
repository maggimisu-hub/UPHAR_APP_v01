import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../lib/supabaseClient";
import { productService } from "../services/productService";
import { orderService } from "../services/orderService";
import { getCurrentUser, signInWithEmail, signOutCurrentUser } from "../services/authService";
import type { Address, CartItem, CheckoutFormValues, Order, Product } from "../types";

const STORAGE_KEY = "stitch-ui-store";

type PersistedState = {
  cart: CartItem[];
  wishlist: string[];
  addresses: Address[];
  orders: Order[];
};

type StoreContextValue = {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  addresses: Address[];
  orders: Order[];
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
  cartDetailed: Array<{ product: Product; size: string; quantity: number; lineTotal: number }>;
  userId: string | null;
  isUserAuthenticated: boolean;
  authLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  placeOrder: (shipping: CheckoutFormValues) => Promise<Order | null>;
  confirmPayment: (orderId: string) => Order | null;
  getProductById: (productId: string) => Product | undefined;
  getProductsByCategory: (category: Product["category"]) => Product[];
  getFeaturedProducts: () => Product[];
  getNewArrivals: () => Product[];
  searchProducts: (query: string) => Product[];
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return { cart: [], wishlist: [], addresses: [], orders: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { cart: [], wishlist: [], addresses: [], orders: [] };
    }
    return JSON.parse(raw) as PersistedState;
  } catch {
    return { cart: [], wishlist: [], addresses: [], orders: [] };
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [variantIdByProductAndSize, setVariantIdByProductAndSize] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    const state = loadState();
    setCart(state.cart);
    setWishlist(state.wishlist);
    setAddresses(state.addresses);
    setOrders(state.orders);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cart, wishlist, addresses, orders }),
    );
  }, [addresses, cart, hydrated, orders, wishlist]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUserId(currentUser?.id ?? null);
        setAuthLoading(false);

        const authSubscription = supabase.auth.onAuthStateChange((_, session) => {
          if (session?.user?.id) {
            setUserId(session.user.id);
          } else {
            setUserId(null);
          }
        });
        subscription = authSubscription.data.subscription;
      } catch {
        setUserId(null);
        setAuthLoading(false);
      }
    };

    initAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        const variantIndex: Record<string, Record<string, string>> = {};

        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          images: p.images,
          category: "men" as const, // Default category, will be updated when backend has categories
          sizes: p.variants.map((v) => v.name),
          description: p.description || "",
          tag: p.isFeatured ? "Featured" : p.isNew ? "New Arrival" : "Signature",
          featured: p.isFeatured,
          newArrival: p.isNew,
        }));

        data.forEach((product) => {
          variantIndex[product.id] = {};
          product.variants.forEach((variant) => {
            variantIndex[product.id][variant.name] = variant.id;
          });
        });

        setVariantIdByProductAndSize(variantIndex);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to load products from Supabase", error);
        setProducts([]);
        setVariantIdByProductAndSize({});
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      if (!userId) return;
      try {
        const data = await orderService.getCustomerOrders(userId);
        setOrders(data);
      } catch (error) {
        console.error("Failed to load customer orders", error);
      }
    };

    void loadOrders();
  }, [userId]);

  const cartDetailed = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) {
          return [];
        }

        return [
          {
            product,
            size: item.size,
            quantity: item.quantity,
            lineTotal: item.quantity * product.price,
          },
        ];
      }),
    [cart, products],
  );

  const cartSubtotal = cartDetailed.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isUserAuthenticated = Boolean(userId);

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
    const user = await getCurrentUser();
    setUserId(user?.id ?? null);
  };

  const signOut = async () => {
    await signOutCurrentUser();
    setUserId(null);
  };

  const addToCart = (productId: string, size: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === productId && item.size === size,
      );
      if (!existing) {
        return [...current, { productId, size, quantity }];
      }
      return current.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
          : item,
      );
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size)),
    );
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item,
      ),
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const addAddress = (address: Omit<Address, "id">) => {
    setAddresses((current) => [
      ...current.map((entry) => ({ ...entry, isDefault: false })),
      { ...address, id: `addr-${Date.now()}` },
    ]);
  };

  const placeOrder = async (shippingDetails: CheckoutFormValues) => {
    if (!userId) {
      throw new Error("You must be signed in to place an order");
    }

    if (cart.length === 0) {
      return null;
    }

    const addressId = await orderService.createAddressForCheckout(userId, shippingDetails);

    const orderItems: Array<{ product_id: string; variant_id: string; quantity: number }> = cart.map(
      (item) => {
        const variantId = variantIdByProductAndSize[item.productId]?.[item.size];
        if (!variantId) {
          throw new Error(
            "One or more cart variants are invalid. Please remove and re-add items.",
          );
        }

        return {
          product_id: item.productId,
          variant_id: variantId,
          quantity: item.quantity,
        };
      },
    );

    const result = await orderService.createOrder(
      userId,
      addressId,
      "cod",
      orderItems,
    );

    const shippingCost = 0;

    const order: Order = {
      id: result.orderId,
      items: cart,
      shipping: shippingDetails,
      subtotal: cartSubtotal,
      shippingCost,
      total: cartSubtotal + shippingCost,
      orderStatus: "pending",
      paymentStatus: "cod",
      createdAt: new Date().toISOString(),
    };

    setOrders((current) => [order, ...current]);
    setCart([]);

    return order;
  };

  const confirmPayment = (orderId: string) => {
    let updated: Order | null = null;

    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        updated = {
          ...order,
          orderStatus: "confirmed",
          paymentStatus: "paid",
        };
        return updated;
      }),
    );
    setCart([]);
    return updated;
  };

  const getProductById = (productId: string) =>
    products.find((product) => product.id === productId);

  const getProductsByCategory = (category: Product["category"]) =>
    products.filter((product) => product.category === category);

  const getFeaturedProducts = () => products.filter((product) => product.featured);
  const getNewArrivals = () => products.filter((product) => product.newArrival);
  const searchProducts = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return products.filter((product) =>
      [product.name, product.category, product.description, product.tag]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        addresses,
        orders,
        cartCount,
        wishlistCount: wishlist.length,
        cartSubtotal,
        cartDetailed,
        userId,
        isUserAuthenticated,
        authLoading,
        signInWithEmail: signIn,
        signOut,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        addAddress,
        placeOrder,
        confirmPayment,
        getProductById,
        getProductsByCategory,
        getFeaturedProducts,
        getNewArrivals,
        searchProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
