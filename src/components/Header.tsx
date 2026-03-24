import '../styles/Header.css'
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Header()
{
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const { clearCart } = useCart();
    const showLoginButton = !user && useLocation().pathname !== "/login" && useLocation().pathname !== "/signup";
    const showLogoutButtons = useLocation().pathname !== "/review-information";
    const showCartButtons = useLocation().pathname !== "/Cart" && useLocation().pathname !== "/checkout" && useLocation().pathname !== "/login" && useLocation().pathname !== "/signup";


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