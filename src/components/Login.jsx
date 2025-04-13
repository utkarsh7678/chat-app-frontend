import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../context/socketContext"; // Importing SocketContext

import "./login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const socket = useSocket(); // Using SocketContext
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
            console.log("Email:", email, "Password:", password);
            console.log("Login Request URL:", `${import.meta.env.VITE_API_URL}/auth/login`);

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email: email.toLowerCase(),
                password,
            });
            console.log("Login Request Data:", {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                socket.emit("user-online", email);
                navigate("/dashboard");
            } else {
                alert(response.data.message || "Invalid Email or Password ❌");
            }
        } catch (error) {
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
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="show-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "👁️ Hide" : "👁️ Show"}
                    </span>
                </div>

                <button type="submit" className="btn-login">
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="forgot-password" onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
                <p className="register-link" onClick={() => navigate("/register")}>Don't have an account? Register</p>
            </form>
        </div>
    );
};

export default Login;



  