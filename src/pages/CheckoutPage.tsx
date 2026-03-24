import '../styles/SignupPage.css'
import Header from "../components/Header";
import { useUser } from "../contexts/UserContext"
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Dropdown from '../components/Dropdown';

function CheckoutPage()
{
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const { charge } = location.state || {};
    const { subtotal, tax, total } = charge || {};

    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [province, setProvince] = useState("Province");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardSecurityNumber, setCardSecurityNumber] = useState("");
    let provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland & Labrador", "Nova Scotia",
        "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"
    ];

    const loadUserInfo = () => {
        if (user) {
            setAddress(user.address || '');
            setCity(user.city || '');
            setZip(user.zip || '');
            setProvince(user.province || "Province");
            setCardNumber(user.cardNumber || '');
            setCardExpiry(user.cardExpiry || '');
            setCardSecurityNumber(user.cardSecurityNumber || '');
        }
    }

    const resetForm = () => {
        setAddress('');
        setCity('');
        setZip('');
        setProvince("Province");
        setCardNumber('');
        setCardExpiry('');
        setCardSecurityNumber('');
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(validateForm()) return;
        navigate("/order-placed", {
            state:{
                user: { firstName: user?.firstName, lastName: user?.lastName, email: user?.email, phone: user?.phone },
                shipping: { address, city, zip, province },
                charge: { subtotal, tax, total }
            }
        })
    }

    const validateForm = (): string | null => {       
        if(!address || !city || !zip)
        {
            alert("Shipping info is incomplete");
            return "error";
        }
        if(province === "Province")
        {
            alert("Please select a province");
            return "error";
        }
        if(!cardNumber.match(/^\d{16}$/))
        {
            alert("Card number must be 16 digits");
            return "error";
        }
        if(!cardExpiry.match(/^\d{2}\/\d{2}$/))
        {
            alert("Expiry format is MM/YY");
            return "error";
        }   
        if(!cardSecurityNumber.match(/^\d{3}$/))
        {
            alert("Security code must be 3 digits");
            return "error";
        }
        return null;
    }

    return(
        <div>
            <Header/>
            <div>
                <button type="button" className="btn btn-secondary me-4" style={{marginLeft: "50px"}} onClick={() => navigate("/")}>Back to Catalog</button>
            </div><br></br><br></br>
            <h2 style={{marginLeft:"0px"}}>Enter your information</h2>
            <form onSubmit={handleSubmit}>
                <div style={{marginLeft:"50px"}} className="text-start">
                    <button type="button" className="btn btn-secondary me-4" onClick={loadUserInfo}>Load my information</button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>Enter my own information</button>
                </div><br></br>
                <div className="signupContainer">
                    <div style={{padding: "15px"}}>
                        <h3>Shipping Information:</h3>
                        <p>Address:<br></br><input type="text" value={address} placeholder="Address" onChange={(e) => setAddress(e.target.value)}/>
                        </p>
                        <p>City:<br></br><input type="text" value={city} placeholder="City" onChange={(e) => setCity(e.target.value)}/>
                        </p>
                        <p>ZIP Code:<br></br><input type="text" value={zip} placeholder="ZIP Code" onChange={(e) => setZip(e.target.value)}/>
                        </p>
                        <div>Province:<Dropdown text={province} options={provinces} onSelect={(value) => setProvince(value)}/>
                        </div>
                        <hr></hr>
                        <h3>Billing Information</h3>
                        <p>Card Number:<br></br><input type="text" value={cardNumber} placeholder="Card Number" onChange={(e) => setCardNumber(e.target.value)}/>
                        </p>
                        <p>Card Expiry Date (MM/YY):<br></br><input type="text" value={cardExpiry} placeholder="Card Expiry (MM/YY)" onChange={(e) => setCardExpiry(e.target.value)}/>
                        </p>
                        <p>Security Code:<br></br><input type="text" value={cardSecurityNumber} placeholder="Security Code" onChange={(e) => setCardSecurityNumber(e.target.value)}/>
                        </p>
                    </div>
                </div><br></br><br></br>
                <div>
                    <button type="submit" className="btn btn-success" style={{marginLeft: "50px", marginBottom: "100px"}}>Place Order</button>
                    <button type="button" className="btn btn-danger" style={{marginLeft: "25px", marginBottom: "100px"}}  onClick={resetForm}>Clear Form</button>
                </div>
            </form>
        </div>
    );
}

export default CheckoutPage;