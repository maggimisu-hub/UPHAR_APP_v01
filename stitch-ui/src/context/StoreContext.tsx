import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { supabase } from "../lib/supabaseClient";
import { productService } from "../services/productService";
import { orderService } from "../services/orderService";
import { getCurrentUser, signInWithEmail, signUpWithEmail, signOutCurrentUser } from "../services/authService";
import type { Address, CartItem, CheckoutFormValues, Order, Product, ProductType, ProductCollection } from "../types";

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
  cartDetailed: Array<{ product: Product; size: string; quantity: number; lineTotal: number; availableStock: number }>;
  lastAdjustmentMessage: string | null;
  userId: string | null;
  isUserAuthenticated: boolean;
  authLoading: boolean;
  productsLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ session: any; user: any }>;
  signOut: () => Promise<void>;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  placeOrder: (shipping: CheckoutFormValues) => Promise<Order | null>;
  confirmPayment: (orderId: string) => Order | null;
  refreshOrders: () => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  getProductsByType: (type: ProductType) => Product[];
  getProductsByCollection: (collection: ProductCollection) => Product[];
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
  const [productsLoading, setProductsLoading] = useState(true);
  const [variantIdByProductAndSize, setVariantIdByProductAndSize] = useState<
    Record<string, Record<string, string>>
  >({});
  const [lastAdjustmentMessage, setLastAdjustmentMessage] = useState<string | null>(null);

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
          media: p.media,
          product_type: p.product_type as ProductType,
          product_collection: p.product_collection as ProductCollection,
          is_returnable: p.is_returnable,
          return_policy_note: p.return_policy_note || undefined,
          sizes: p.variants.map((v) => v.name),
          description: p.description || "",
          tag: p.isFeatured ? "Featured" : p.isNew ? "New Arrival" : "Signature",
          variantStock: p.variants.reduce((acc, v) => ({ ...acc, [v.name]: v.stock }), {}),
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
      } finally {
        setProductsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!userId) return;
    const data = await orderService.getCustomerOrders(userId);
    setOrders(data);
  }, [userId]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        await refreshOrders();
      } catch (error) {
        console.error("Failed to load customer orders", error);
      }
    };

    void loadOrders();
  }, [refreshOrders]);

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
            availableStock: product.variantStock?.[item.size] ?? 0,
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

  const signUp = async (email: string, password: string) => {
    const data = await signUpWithEmail(email, password);
    if (data.session) {
      const user = await getCurrentUser();
      setUserId(user?.id ?? null);
    }
    return data;
  };

  const signOut = async () => {
    await signOutCurrentUser();
    setUserId(null);
  };

  const addToCart = (productId: string, size: string, quantity = 1) => {
    setCart((current) => {
      const product = products.find((p) => p.id === productId);
      const stock = product?.variantStock?.[size] ?? 0;

      const existing = current.find(
        (item) => item.productId === productId && item.size === size,
      );

      if (!existing) {
        if (stock <= 0) return current;
        const initialQty = Math.min(quantity, stock);
        return [...current, { productId, size, quantity: initialQty }];
      }

      return current.map((item) => {
        if (item.productId === productId && item.size === size) {
          const newQty = Math.min(item.quantity + quantity, stock);
          return { ...item, quantity: newQty };
        }
        return item;
      });
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

    const product = products.find((p) => p.id === productId);
    const stock = product?.variantStock?.[size] ?? 0;

    setCart((current) =>
      current.map((item) => {
        if (item.productId === productId && item.size === size) {
          if (quantity > stock) {
            setLastAdjustmentMessage("Quantity adjusted to available stock.");
            window.setTimeout(() => setLastAdjustmentMessage(null), 3000);
            return { ...item, quantity: stock };
          }
          return { ...item, quantity };
        }
        return item;
      }),
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
    
  const getProductsByType = (type: ProductType) =>
    products.filter((product) => product.product_type === type);

  const getProductsByCollection = (collection: ProductCollection) =>
    products.filter((product) => product.product_collection === collection);

  const getFeaturedProducts = () => products.filter((product) => product.featured);
  const getNewArrivals = () => products.filter((product) => product.newArrival);
  const searchProducts = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return products.filter((product) =>
      [product.name, product.product_type, product.product_collection, product.description, product.tag]
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
        lastAdjustmentMessage,
        userId,
        isUserAuthenticated,
        authLoading,
        productsLoading,
        signInWithEmail: signIn,
        signUpWithEmail: signUp,
        signOut,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        addAddress,
        placeOrder,
        confirmPayment,
        refreshOrders,
        getProductById,
        getProductsByType,
        getProductsByCollection,
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
