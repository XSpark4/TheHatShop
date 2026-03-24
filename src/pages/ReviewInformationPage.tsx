import Header from '../components/Header'
import Dropdown from '../components/Dropdown';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react';
import { supabase } from '../services/supaBaseClient'
import { useUser } from '../contexts/UserContext'

function ReviewInformation(){
    const navigate = useNavigate();
    const {user, setUser } = useUser();

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [zip, setZip] = useState("")
    const [province, setProvince] = useState("Province")
    const [cardNumber, setCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardSecurityNumber, setCardSecurityNumber] = useState("")
    let provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland & Labrador", "Nova Scotia",
        "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"
    ];

    useEffect(() => {
        if (!user) {
            alert("You must be logged in to review your account details")
            navigate("/login");
            return;
        }
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPhone(user.phone || "");
        setAddress(user.address || "");
        setCity(user.city || "");
        setZip(user.zip || "");
        setProvince(user.province || "Province");
        setCardNumber(user.cardNumber || "");
        setCardExpiry(user.cardExpiry || "");
        setCardSecurityNumber(user.cardSecurityNumber || "");
    }, [user, navigate]);

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(validateForm()) return;

        const {error: message} = await supabase.from("User").update([{
            firstName,
            lastName,
            phone,
            address,
            city,
            zip,
            province,
            cardNumber,
            cardExpiry,
            cardSecurityNumber
        }]).eq("id", user!.id);

        if(message)
        {
            alert(message.message);
            return;
        }

        setUser({
            id: user!.id,
            firstName,
            lastName,
            phone,
            email: user!.email,
            address,
            city,
            zip,
            province,
            cardNumber,
            cardExpiry,
            cardSecurityNumber,
            })
        alert("Account successfully updated!");
        navigate("/");
    }

    const resetForm = () =>{
        setFirstName("");
        setLastName("");
        setPhone("");
        setAddress("");
        setCity("");
        setProvince("Province");
        setZip("");
        setCardNumber("");
        setCardExpiry("");
        setCardSecurityNumber("");
    }

    const validateForm = (): string | null => {
        if(!firstName)
        {
            alert("First name is missing");
            return "error";
        }
        if(!lastName)
        {
            alert("Last name is missing");
            return "error";
        }
        if(!phone)
        {
            alert("Phone number is missing");
            return "error";
        }
        if(!phone.match(/^\d{10}$/))
        {
            alert("Phone number must be 10 digits");
            return "error";
        }        
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
        <>
            <Header/>
            <div>
                <button type="button" className="btn btn-secondary me-4" style={{marginLeft: "50px"}} onClick={() => navigate("/")}>Back to Catalog</button>
            </div><br></br><br></br>
            <form onSubmit={handleSubmit}>
                <h2>Review your Account Information</h2>
                <div className="signupContainer">
                    <div style={{padding: "15px"}}>
                        <h3>Contact Information:</h3>
                        <p>First Name :<br></br><input type="text" value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)}/>
                        </p>
                        <p>Last Name:<br></br><input type="text" value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)}/>
                        </p>
                        <p>Phone Number:<br></br><input type="text" value={phone} placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)}/>
                        </p>
                        <p>Email:<br></br><input type="text"  placeholder="Email" disabled/>
                        </p>
                        <p>Password:<br></br><input type="password" placeholder="Password" disabled/>
                        </p>
                        <p>Confirm Password:<br></br><input type="password" placeholder="Confirm Password" disabled/>
                        </p>
                        <hr></hr>
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
                    <button type="submit" className="btn btn-success" style={{marginLeft: "50px", marginBottom: "100px"}} onSubmit={validateForm}>Update Account</button>
                    <button type="button" className="btn btn-danger" style={{marginLeft: "25px", marginBottom: "100px"}}  onClick={resetForm}>Clear Form</button>
                </div>
            </form>
        </>
    );
}

export default ReviewInformation;