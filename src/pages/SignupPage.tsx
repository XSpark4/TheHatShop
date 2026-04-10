import '../styles/SignupPage.css'
import Header from '../components/Header'
import Dropdown from '../components/Dropdown';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import type { SyntheticEvent } from 'react';
import { supabase } from '../services/supaBaseClient'
import { useUser } from '../contexts/UserContext';

function SignupPage() {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) return;

        const { data: newUser, error: message } = await supabase.from("User").insert([{
            firstName,
            lastName,
            phone,
            email,
            password,
            address,
            city,
            zip,
            province,
            cardNumber,
            cardExpiry,
            cardSecurityNumber
        }]).select().single();

        setUser(newUser);

        if (message) {
            alert(message.message);
            return;
        }

        alert("Account successfully created!");
        navigate("/");
        return;
    }

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAddress("");
        setCity("");
        setZip("");
        setCardNumber("");
        setCardExpiry("");
        setCardSecurityNumber("");
    }

    const validateForm = (): string | null => {
        if (!firstName) {
            alert("First name is missing");
            return "error";
        }
        if (!lastName) {
            alert("Last name is missing");
            return "error";
        }
        if (!phone) {
            alert("Phone number is missing");
            return "error";
        }
        if (!phone.match(/^\d{10}$/)) {
            alert("Phone number must be 10 digits");
            return "error";
        }
        if (!email) {
            alert("Email is missing");
            return "error";
        }
        if (!email.includes('@')) {
            alert("Email is invalid");
            return "error";
        }
        if (!password) {
            alert("Password is missing");
            return "error";
        }
        if (!confirmPassword) {
            alert("Please confirm your password");
            return "error";
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return "error";
        }
        if (!address || !city || !zip) {
            alert("Shipping info is incomplete");
            return "error";
        }
        if (province === "Province") {
            alert("Please select a province");
            return "error";
        }
        if (!cardNumber.match(/^\d{16}$/)) {
            alert("Card number must be 16 digits");
            return "error";
        }
        if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
            alert("Expiry format is MM/YY");
            return "error";
        }
        if (!cardSecurityNumber.match(/^\d{3}$/)) {
            alert("Security code must be 3 digits");
            return "error";
        }
        return null;
    }

    return (
        <>
            <Header />
            <div>
                <button type="button" className="btn btn-secondary me-4" style={{ marginLeft: "50px" }} onClick={() => navigate("/")}>Back to Catalog</button>
            </div><br></br><br></br>
            <form onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <div className="signupContainer">
                    <div style={{ padding: "15px" }}>
                        <h3>Contact Information:</h3>
                        <p>First Name :<br></br><input type="text" value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
                        </p>
                        <p>Last Name:<br></br><input type="text" value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
                        </p>
                        <p>Phone Number:<br></br><input type="text" value={phone} placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />
                        </p>
                        <p>Email:<br></br><input type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </p>
                        <p>Password:<br></br><input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                        </p>
                        <p>Confirm Password:<br></br><input type="password" value={confirmPassword} placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                        </p>
                        <hr></hr>
                        <h3>Shipping Information:</h3>
                        <p>Address:<br></br><input type="text" value={address} placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
                        </p>
                        <p>City:<br></br><input type="text" value={city} placeholder="City" onChange={(e) => setCity(e.target.value)} />
                        </p>
                        <p>ZIP Code:<br></br><input type="text" value={zip} placeholder="ZIP Code" onChange={(e) => setZip(e.target.value)} />
                        </p>
                        <div>Province:<Dropdown text={province} options={provinces} onSelect={(value) => setProvince(value)} />
                        </div>
                        <hr></hr>
                        <h3>Billing Information</h3>
                        <p>Card Number:<br></br><input type="text" value={cardNumber} placeholder="Card Number" onChange={(e) => setCardNumber(e.target.value)} />
                        </p>
                        <p>Card Expiry Date (MM/YY):<br></br><input type="text" value={cardExpiry} placeholder="Card Expiry (MM/YY)" onChange={(e) => setCardExpiry(e.target.value)} />
                        </p>
                        <p>Security Code:<br></br><input type="text" value={cardSecurityNumber} placeholder="Security Code" onChange={(e) => setCardSecurityNumber(e.target.value)} />
                        </p>
                    </div>
                </div><br></br><br></br>
                <div>
                    <button type="submit" className="btn btn-success" style={{ marginLeft: "50px", marginBottom: "100px" }} onSubmit={validateForm}>Create Account</button>
                    <button type="button" className="btn btn-danger" style={{ marginLeft: "25px", marginBottom: "100px" }} onClick={resetForm}>Clear Form</button>
                </div>
            </form>
        </>
    )
}

export default SignupPage;