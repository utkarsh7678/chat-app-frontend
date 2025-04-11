import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./forgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();

    const sendOtp = async () => {
        try {
            const lowerCaseEmail = email.toLowerCase(); // Convert email to lowercase before sending
            const response = await axios.post("http://localhost:3000/auth/send-reset-otp", { email: lowerCaseEmail, purpose: "reset-password" });

            setOtpSent(true);
            alert(response.data.message || "✅ OTP sent to your email");
        } catch (error) {
            console.error("Error sending OTP:", error.response?.data?.error || error.message);
            alert(error.response?.data?.error || "❌ Failed to send OTP");
        }
    };

    const resetPassword = async () => {
        try {
            const lowerCaseEmail = email.toLowerCase(); // Convert email to lowercase
            const response = await axios.post("http://localhost:3000/auth/reset-password", { email: lowerCaseEmail, otp, newPassword });

            alert(response.data.message || "✅ Password reset successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Error resetting password:", error.response?.data?.error || error.message);
            alert(error.response?.data?.error || "❌ Invalid OTP or error resetting password");
        }
    };

    return (
        <div className="forgot-container">
            <form className="forgot-form">
                <h2>Forgot Password</h2>
                {!otpSent ? (
                    <>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                        <button type="button" onClick={sendOtp}>Send OTP</button>
                    </>
                ) : (
                    <>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" required />
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" required />
                        <button type="button" onClick={resetPassword}>Reset Password</button>
                    </>
                )}
            </form>
        </div>
    );
};

export default ForgotPassword;

