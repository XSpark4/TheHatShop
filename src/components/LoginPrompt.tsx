import '../styles/LoginPrompt.css'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import type { SyntheticEvent } from "react";
import { supabase } from '../services/supaBaseClient'
import { useUser } from '../contexts/UserContext';

function LoginPrompt()
{
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const {data} = await supabase.from("User").select("*").eq("email", email).eq("password", password).single();
        if (!data) {
            alert("Invalid username or password");
        } else {
            alert("Login Successful!");
            setUser({
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                zip: data.zip,
                province: data.province,
                cardNumber: data.cardNumber,
                cardExpiry: data.cardExpiry,
                cardSecurityNumber: data.cardSecurityNumber
            })
            navigate("/");
        }
    }

    return(
        <div>
            <button type="button" className="btn btn-secondary me-4" style={{marginLeft: "50px"}} onClick={() => navigate("/")}>Back to Catalog</button>
            <div className="centerContainer">
                <table className="loginTable">
                    <tbody>
                        <tr>
                            <td>
                                <form onSubmit={handleLogin}>
                                    Email:<br></br>
                                    <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)}></input><br></br><br></br>
                                    Password:<br></br>
                                    <input type="text" placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input><br></br><br></br><br></br>
                                    <button type="submit" className="btn btn-primary" style={{width: "140px"}}>Login</button><br></br><br></br>
                                </form>
                                <a href="/signup">Need an account? Sign up here</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LoginPrompt;