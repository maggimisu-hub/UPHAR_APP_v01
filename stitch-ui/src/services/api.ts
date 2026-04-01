// Placeholder API service for future Supabase integration

export const api = {
  products: {
    getAll: async () => {
      console.log('Fetching all products...');
      return [];
    },
    getById: async (id: string) => {
      console.log(`Fetching product ${id}...`);
      return null;
    }
  },
  cart: {
    get: async () => {
      console.log('Fetching cart...');
      return { items: [], total: 0 };
    },
    addItem: async (productId: string, quantity: number) => {
      console.log(`Adding ${quantity} of ${productId} to cart...`);
      return true;
    },
    removeItem: async (productId: string) => {
      console.log(`Removing ${productId} from cart...`);
      return true;
    }
  },
  orders: {
    create: async (cartId: string, addressId: string) => {
      console.log(`Creating order for cart ${cartId}...`);
      return { id: 'UP-MOCK-123', status: 'pending' };
    },
    getById: async (id: string) => {
      console.log(`Fetching order ${id}...`);
      return null;
    },
    getUserOrders: async (userId: string) => {
      console.log(`Fetching orders for user ${userId}...`);
      return [];
    }
  },
  payments: {
    process: async (orderId: string, paymentDetails: any) => {
      console.log(`Processing payment for order ${orderId}...`);
      return { success: true, transactionId: 'TXN-MOCK-456' };
    }
  },
  shipments: {
    track: async (trackingId: string) => {
      console.log(`Tracking shipment ${trackingId}...`);
      return { status: 'in_transit', estimatedDelivery: '2023-11-07' };
    }
  }
};
