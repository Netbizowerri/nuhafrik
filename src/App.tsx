import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { HomePage } from './pages/home/HomePage';
import { ShopPage } from './pages/shop/ShopPage';
import { ProductDetailPage } from './pages/product/ProductDetailPage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrderSuccessPage } from './pages/checkout/OrderSuccessPage';
import { OrdersListPage } from './pages/orders/OrdersListPage';
import { OrderTrackingPage } from './pages/orders/OrderTrackingPage';
import { AccountPage } from './pages/account/AccountPage';
import { LoginPage } from './pages/account/LoginPage';
import { SearchPage } from './pages/search/SearchPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AboutPage } from './pages/about/AboutPage';
import { ContactPage } from './pages/contact/ContactPage';
import { FAQPage } from './pages/help/FAQPage';
import { ShippingReturnsPage } from './pages/help/ShippingReturnsPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { withAdminAuth } from './hoc/withAdminAuth';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProtectedAdminDashboard = withAdminAuth(AdminDashboard);
const ProtectedAdminProductsPage = withAdminAuth(AdminProductsPage);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<ProtectedAdminDashboard />} />
              <Route path="/admin/products" element={<ProtectedAdminProductsPage />} />
            </Route>

            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/orders" element={<OrdersListPage />} />
              <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
