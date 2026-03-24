import '../styles/CartTable.css'
import Header from '../components/Header'
import CartTableRow from '../components/CartTableRow';
import { useCart } from '../contexts/CartContext'
import { useUser } from '../contexts/UserContext'
import { useNavigate, Link } from 'react-router-dom';

function CartPage()
{
    const { cart, clearCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();

    const handleClear = () => {
        clearCart();
    }

    const handleCheckout = () => {
        if(!user){
            alert("Please log in before checking out")
            navigate("/login");
            return;
        }
        else{
            navigate("/checkout");
        }
    }

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
                            <button type="button" style={{marginLeft:"50px"}} className="btn btn-danger" onClick={() => handleClear()}>Clear Cart</button>
                            <button type="button" style={{marginLeft:"50px"}} className="btn btn-primary" onClick={() => handleCheckout()}>Checkout</button>
                        </div>
                    </div>) :
                    (<div className="cartContainer" style={{marginLeft: "50px"}}>
                        Your cart is empty. 
                        <Link to="/">Click here to return to the catalog.</Link>
                    </div>)}
            </div>
        </div>
    );
}

export default CartPage;