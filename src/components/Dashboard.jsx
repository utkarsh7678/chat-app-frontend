import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

const Dashboard = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [friends, setFriends] = useState([]);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login"); // Redirect to login if no token found
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch active users with authentication
                const userResponse = await axios.get("http://localhost:3000/api/users/active", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setActiveUsers(userResponse.data);

                // Fetch available groups with authentication
                const groupResponse = await axios.get("http://localhost:3000/api/groups", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGroups(groupResponse.data);
                const friendsResponse = await axios.get("http://localhost:3000/api/friends", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(friendsResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleChat = (id, type) => {
        navigate(`/chat/${type}/${id}`); // Navigate to chat (type = 'user' or 'group')
    };
    // Add friend by email
    const handleAddFriend = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:3000/api/add-friend",
                { email }, // Sending email to backend
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.message);
            setEmail(""); // Clear input
        } catch (error) {
            alert(error.response?.data?.error || "Error adding friend");
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome to ChatApp Dashboard</h2>

            <div className="section">
                <h3>Active People</h3>
                <ul>
                    {activeUsers.length > 0 ? (
                        activeUsers.map((user) => (
                            <li key={user.id} onClick={() => handleChat(user.id, "user")}>
                                👤 {user.username}
                            </li>
                        ))
                    ) : (
                        <p>No active users</p>
                    )}
                </ul>
            </div>

            <div className="section">
                <h3>Groups</h3>
                <ul>
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <li key={group.id} onClick={() => handleChat(group.id, "group")}>
                                📢 {group.name}
                            </li>
                        ))
                    ) : (
                        <p>No groups available</p>
                    )}
                </ul>
            </div>
                {/* Friends Section */}
                <div className="section">
                <h3>My Friends</h3>
                <ul>
                    {friends.length > 0 ? (
                        friends.map((friend) => (
                            <li key={friend.id} className="friend-item">
                                {friend.isActive ? <span className="blue-dot">🔵</span> : <span className="gray-dot">⚪</span>}
                                {friend.username}
                            </li>
                        ))
                    ) : (
                        <p>No friends added yet</p>
                    )}
                </ul>
            </div>
            {/* Add Friend Section */}
            <div className="section">
                <h3>Add Friend by Email</h3>
                <input
                    type="email"
                    placeholder="Enter friend's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleAddFriend}>Add Friend</button>
            </div>  
        </div>
    );
};

export default Dashboard;

