import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Login form submitted");
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
            console.log("Response received:", response.data);
            if (response.data.token) {
                localStorage.setItem("token", response.data.token); 
                console.log("Token received:", response.data.token);
                console.log("Redirecting to dashboard...");
               
                
                console.log("Login successful! Redirecting to Dashboard...");
                navigate("/dashboard"); // Redirect to dashboard page
            
                
            }
            else {
                alert(response.data.message || "Invalid Email or Password ❌");
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data?.error || error.message);
            alert(error.response?.data?.error || "❌ Invalid Email or Password");

        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login to ChatApp</h2>
                
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <span className="show-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "👁️ Hide" : "👁️ Show"}
                    </span>
                </div>
                <button
    type="submit"
    className="btn-login"
    onClick={() => console.log("Login button clicked")}
>
    Login
</button>

               

                <p className="forgot-password" onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
                <p className="register-link" onClick={() => navigate("/register")}>Don't have an account? Register</p>
            </form>
        </div>
    );
};

export default Login;


  