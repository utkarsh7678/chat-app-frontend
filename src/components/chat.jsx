import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./chat.css";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [searchParams] = useSearchParams();
    
    const userId = localStorage.getItem("userId"); // Current logged-in user
    const chatWith = searchParams.get("user"); // User ID from query params

    useEffect(() => {
        if (chatWith) {
            fetchMessages();
        }
    }, [chatWith]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/chat/messages/${userId}/${chatWith}`);
            setMessages(res.data.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            await axios.post("http://localhost:3000/api/chat/send", {
                senderId: userId,
                receiverId: chatWith,
                text: message
            });

            setMessages([...messages, { senderId: userId, text: message }]);
            setMessage(""); // Clear input
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="chat-container">
            <h2>Chat with {chatWith}</h2>
            
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <p key={index} className={msg.senderId === userId ? "sent" : "received"}>
                        {msg.text}
                    </p>
                ))}
            </div>

            <div className="chat-input">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;

