import '../styles/Header.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';

function Header()
{
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useUser();
    const { clearCart } = useCart();
    const showLoginButton = !user && location.pathname !== "/login" && location.pathname !== "/signup";
    const showLogoutButtons = location.pathname !== "/review-information" && location.pathname !== "/order-placed";
    const showCartButtons = location.pathname !== "/cart" && location.pathname !== "/checkout" && location.pathname !== "/login" && location.pathname !== "/signup" && location.pathname !== "/order-placed";
    const showOrderHistoryButton = user && location.pathname !== "/order-history" && location.pathname !== "/login" && location.pathname !== "/signup";

    const handleLogout = () => {
        setUser(null);
        clearCart();
        alert("Successfully logged out.");
        navigate("/");
    };

    return(
        <header>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {showLoginButton &&(
                    <div className="text-end">
                        <button type="button" className="btn btn-primary" style={{width: "140px"}} onClick={() => {navigate("/login")}}>Login</button>
                    </div>
                )}
                {user && showLogoutButtons && <div className="text-end">
                    Welcome, {user.firstName}
                    <button type="button" className="btn btn-danger" style={{width: "140px", marginLeft: "15px"}} onClick={handleLogout}>Logout</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/review-information")} style={{width: "140px", marginLeft: "15px"}}>Review Information</button>
                </div>}

                {showOrderHistoryButton && (
                    <button type="button" className="btn btn-secondary" style={{width: "140px", marginLeft: "15px"}} onClick={() => navigate("/order-history")}>Order History</button>
                )}

                {showCartButtons && (
                    <button type="button" className="btn btn-success" style={{width: "140px", marginLeft: "15px"}} onClick={() => {navigate("/cart")}}>View Cart</button>
                )}
            </div>
            <h1>The Hat Shop</h1>
            <h2>Its a Beautiful Day!</h2>
            <hr></hr>
        </header>
    );
}

export default Header;
