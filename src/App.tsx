import {Routes, Route } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProductDescriptionPage from './pages/ProductDescriptionPage'
import ReviewInformationPage from './pages/ReviewInformationPage'

function App()
{
  return(
    <Routes>
      <Route path="/" element={<CatalogPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<SignupPage/>}/>
      <Route path="/review-information" element={<ReviewInformationPage/>}/>
      <Route path="/product/:id" element={<ProductDescriptionPage/>}/>
    </Routes>
  )
}

export default App;