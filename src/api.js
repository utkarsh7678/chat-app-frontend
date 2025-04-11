import axios from "axios";

const API_URL = "http://localhost:3000/api"; // Update if your backend runs on a different port

export const sendMessage = async (messageData) => {
    return await axios.post(`${API_URL}/messages`, messageData);
};

export const fetchMessages = async () => {
    return await axios.get(`${API_URL}/messages`);
};
