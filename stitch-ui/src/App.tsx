import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { StoreProvider } from "./context/StoreContext";
import Account from "./pages/Account";
import Addresses from "./pages/Addresses";
import AdminLayout from "./pages/Admin";
import AdminInventory from "./pages/Admin/Inventory";
import AdminOrders from "./pages/Admin/Orders";
import AdminProducts from "./pages/Admin/Products";
import AIStylist from "./pages/AIStylist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import Payment from "./pages/Payment";
import PaymentReturn from "./pages/PaymentReturn";
import ProductDetail from "./pages/ProductDetail";
import Men from "./pages/Men";
import Shop from "./pages/Shop";
import TryOn from "./pages/TryOn";
import Wishlist from "./pages/Wishlist";
import Women from "./pages/Women";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="men" element={<Men />} />
            <Route path="women" element={<Women />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="payment" element={<Payment />} />
            <Route path="payment/return" element={<PaymentReturn />} />
            <Route path="payment-failed" element={<PaymentFailed />} />
            <Route path="order-success/:id" element={<OrderSuccess />} />
            <Route path="order/:id" element={<OrderDetails />} />
            <Route path="account" element={<Account />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="stylist" element={<AIStylist />} />
            <Route path="try-on" element={<TryOn />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
