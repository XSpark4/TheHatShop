import '../styles/CartTable.css'
import Header from '../components/Header'
import CartTableRow from '../components/CartTableRow';
import { useCart } from '../contexts/CartContext'
import type { CartItem } from '../contexts/CartContext'
import { useUser } from '../contexts/UserContext'
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supaBaseClient';

function CartPage()
{
    const { cart, clearCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxRate = 0.13;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    const handleClear = () => {
        clearCart();
    }

    const handleCheckout = async() => {
        if(!user){
            alert("Please log in before checking out")
            navigate("/login");
            return;
        }
        else{
            const valid = await validateCart();
            if (!valid) return;
            navigate("/checkout", {state: {
                charge: {
                    subtotal: subtotal,
                    tax: tax,
                    total: grandTotal}
                }
            });
        }
    }

    const fetchStock = async (cartItems: CartItem[]) => {
        const ids = cartItems.map(item => item.id);

        const { data, error } = await supabase
            .from('Products')
            .select('id, stock')
            .in('id', ids);

        if (error) {
            console.error("Error fetching stock:", error);
            return null;
        }

        return data;
    };

    const validateCart = async (): Promise<boolean> => {
        const stockData = await fetchStock(cart);
        if (!stockData) return false;

        for (const item of cart) {
            const stockItem = stockData.find(p => p.id === item.id);
            if (!stockItem) {
                alert(`Item "${item.name}" not found in database.`);
                return false;
            }
            if (item.qty > stockItem.stock) {
                alert(`Sorry, you cannot order more than ${stockItem.stock} of "${item.name}".`);
                return false;
            }
        }

        return true;
    };

    return(
        <div>
            <Header/>
            <button type="button" style={{marginLeft:"50px"}} className="btn btn-secondary me-4" onClick={() => navigate("/")}>Back to Catalog</button>
            <br></br>
            <br></br>
            <h2 style={{marginLeft: "0px"}}>Your Cart:</h2>
            <div>
                {cart.length !== 0 ? (
                    <div className="cartContainer" style={{marginLeft: "50px"}}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th style={{textAlign: "right", paddingRight: "45px"}}>Remove from cart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item) => <CartTableRow key={item.id} item={item} showRemove={true}/>)}
                            </tbody>
                        </table>
                        <div className="text-end" style={{paddingRight:"25px"}}>
                            <h6>Subtotal: ${subtotal.toFixed(2)}</h6>
                            <h6>+Tax: ${tax.toFixed(2)}</h6>
                            <h3>Grand Total: ${grandTotal.toFixed(2)}</h3>
                            <br></br>
                            <button type="button" style={{marginLeft:"50px"}} className="btn btn-danger" onClick={() => handleClear()}>Clear Cart</button>
                            <button type="button" style={{marginLeft:"50px"}} className="btn btn-primary" onClick={() => handleCheckout()}>Checkout</button>
                        </div>
                    </div>) :
                    (<div className="cartContainer" style={{marginLeft: "50px"}}>
                        Your cart is empty. 
                        <Link to="/">Click here to return to the catalog.</Link>
                    </div>)}
            </div><br></br><br></br><br></br>
        </div>
    );
}

export default CartPage;