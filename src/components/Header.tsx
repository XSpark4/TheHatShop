import '../styles/Header.css'
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLocation } from 'react-router-dom';

function Header()
{
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const showLoginButton = !user && useLocation().pathname !== "/login" && useLocation().pathname !== "/signup";

    const handleLogout = () => {
        setUser(null);
        navigate("/");
    };

    return(
        <header>
            <div>
                {showLoginButton &&(
                    <div className="text-end">
                        <button type="button" className="btn btn-primary" style={{width: "140px"}} onClick={() => {navigate("/login")}}>Login</button>
                    </div>
                )}
                {user && <div className="text-end">
                    Welcome, {user.firstName}
                    <button type="button" className="btn btn-danger" style={{width: "140px", marginLeft: "15px"}} onClick={handleLogout}>Logout</button>
                </div>}
                <h1>The Hat Shop</h1>
            </div>
            <h2>Its a Beautiful Day!</h2>
            <hr></hr>
        </header>
    );
}

export default Header;