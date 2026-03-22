import {Routes, Route } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import ProductDescriptionPage from './pages/ProductDescriptionPage'

function App()
{
  return(
    <Routes>
      <Route path="/" element={<CatalogPage/>}/>
      <Route path="/product/:id" element={<ProductDescriptionPage/>}/>
    </Routes>
  )
}

export default App;