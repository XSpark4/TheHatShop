import {Routes, Route } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProductDescriptionPage from './pages/ProductDescriptionPage'
import ReviewInformationPage from './pages/ReviewInformationPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderPage from './pages/OrderPage'
import ScrollToTop from './components/ScrollToTop'

function App()
{
  return(
    <>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<CatalogPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/review-information" element={<ReviewInformationPage/>}/>
        <Route path="/product/:id" element={<ProductDescriptionPage/>}/>
        <Route path="/cart" element={<CartPage/>}/>
        <Route path="/checkout" element={<CheckoutPage/>}/>
        <Route path="/order-placed" element={<OrderPage/>}/>
      </Routes>
    </>
  )
}

export default App;