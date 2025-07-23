// src/components/ProfileUpload.jsx
import React, { useState } from "react";
import useStore from "../store/useStore"; // ✅ Make sure this path is correct
import axios from "axios";

const ProfileUpload = ({ userId }) => {
    const [file, setFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const token = useStore((state) => state.token); // ✅ Get token from store

    const handleUpload = async () => {
        if (!file) {
            return alert("Please choose a file first.");
        }

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/upload/profile-picture/${userId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`, // ✅ Add token here
                    },
                }
            );
            setUploadMessage("✅ " + response.data.message);
        } catch (error) {
            console.error("Upload error:", error.response?.data || error.message);
            setUploadMessage("❌ Upload failed");
        }
    };

    return (
        <div style={{ margin: "20px 0" }}>
            <h3>Upload Profile Picture</h3>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
            />
            <button onClick={handleUpload}>Upload</button>
            {uploadMessage && <p>{uploadMessage}</p>}
        </div>
    );
};

export default ProfileUpload;

