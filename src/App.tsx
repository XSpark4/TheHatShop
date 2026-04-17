import { Routes, Route } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProductDescriptionPage from './pages/ProductDescriptionPage'
import ReviewInformationPage from './pages/ReviewInformationPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderPage from './pages/OrderPage'
import ScrollToTop from './components/ScrollToTop'
import OrderHistoryPage from "./pages/OrderHistoryPage";
// Dedicated page for entering the admin key and editing inventory.
import AdminLoginPage from './pages/AdminLoginPage'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/review-information" element={<ReviewInformationPage />} />
        <Route path="/product/:id" element={<ProductDescriptionPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-placed" element={<OrderPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        {/* Admin entry route opened from the bottom-right button in the header. */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
      </Routes>
    </>
  )
}

export default App;
