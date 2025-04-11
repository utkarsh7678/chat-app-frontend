import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";  // Ensure Register.css is in the same folder

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    // Send OTP to Email
    const sendOtp = async () => {
        try {
            if (!email) {
                setMessage("❌ Please enter your email");
                return;
              }
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-otp`, { email: email.toLowerCase()});
            setMessage(response.data.message);
            setOtpSent(true);
        } catch (error) {
            setMessage(error.response?.data?.error || "❌ Error sending OTP");
        }
    };

    // Register User
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !email || !password || !otp) {
            setMessage("❌ All fields are required");
            return;
          }
          console.log("Registering with:", {
            username,
            email,
            password,
            otp,
          });
      
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                username,
                email: email.toLowerCase(),
                password,
                otp
            });
            setMessage(response.data.message);

            // Redirect to login after successful registration
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage(error.response?.data?.error || "❌ Registration failed");
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {message && <p className="error-msg">{message}</p>}

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            {/* Send OTP Button */}
            <button type="button" className="btn btn-primary" onClick={sendOtp} disabled={otpSent}>
                {otpSent ? "✅ OTP Sent" : "📩 Send OTP"}
            </button>

            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
            />

            <div className="password-container">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? "👁️ Hide" : "👁️ Show"}
                </button>
            </div>

            <button type="submit" className="btn btn-success" onClick={handleRegister}  disabled={!otpSent}>
                ✅ Register
            </button>

            {/* Login Button after Registration */}
            <button
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
            >
                🔑 Go to Login
            </button>
        </div>
    );
};

export default Register;

