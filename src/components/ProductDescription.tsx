import '../styles/ProductDescription.css'
import { supabase } from '../services/supaBaseClient';
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext';
import type { CartItem } from '../contexts/CartContext'

function ProductDescription()
{
    type Hat = {
        id: number;
        name: string;
        brand: string;
        description: string;
        image: string;
        stock: number;
        price: number;
    }

    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { id } = useParams<{id: string}>();
    const [hat, setHat] = useState<Hat | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function fetchHat() {
            const { data } = await supabase.from('Products').select('*').eq('id', id).single();
                setHat(data);
        }
        if (id) fetchHat();
    }, [id]);

    return(
        <>
            {hat ? (
            <div className="descriptionContainer">
                <button type="button" className="btn btn-secondary me-4" onClick={() => navigate("/")}>Back to Catalog</button>
                <table>
                    <tbody>
                        <tr>
                            <td style={{width: "20%"}}>
                                <img src={hat.image} className="descriptionImage"/>
                            </td>
                            <td style={{width: "55%"}}>
                                <h2>{hat.name}</h2>
                                <h6>{hat.brand}</h6><br></br>{hat.description}
                            </td>
                            <td className="text-end" style={{width: "25%", padding: "10px"}}>
                                <h3>${hat.price}</h3>
                                <h6>{hat.stock} in stock!</h6>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td className="text-end">
                                <input type="number" value={quantity} min={1} max={100} step={1} placeholder="Quantity" style={{width: "150px"}}   onChange={(e) => setQuantity(Number(e.target.value) || 1)}/>
                                <button type="button" className="btn btn-primary me-4" style={{margin: "10px"}} onClick={() => {
                                    console.log(`Adding ${quantity} of ${hat.id} to cart`);
                                    const cartItem = {id: hat.id, qty: quantity};
                                    addToCart(cartItem);
                                    }}>Add to Cart</button>
                            </td>
                        </tr>
                    </tbody>
                </table><br></br>
            </div>) : (
            <div className="descriptionContainer">
                The item you requested is missing or invalid.<br></br><br></br>
                <button type="button" className="btn btn-secondary me-4" onClick={() => navigate("/")}>Back to Catalog</button> 
            </div>
            )
            }
        </>
    )
}

export default ProductDescription;