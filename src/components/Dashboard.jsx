import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../context/socketContext';
import useStore from '../store/useStore';
import "./dashboard.css";

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { activeUsers: socketActiveUsers, socketConnected, socket } = useSocket();
  const { friends, groups, setFriends, setGroups } = useStore();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [groupRes, friendsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/groups`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/friends`, { headers }),
        ]);

        setGroups(groupRes.data);
        setFriends(friendsRes.data);
        socket.emit("user-online");
      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, [navigate, setFriends, setGroups, socket]);

  const handleAddFriend = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/friends/add-friend`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.error || "Error adding friend");
    }
  };

  const handleChat = (id, type) => {
    if (type === "user") {
      navigate(`/chat/${id}`);
    } else if (type === "group") {
      navigate(`/chat/group/${id}`);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome to ChatApp Dashboard</h2>

      <div className="section">
        <h3>Active People {socketConnected ? "🟢" : "🔴"} </h3>
        <ul>
          {socketActiveUsers.length ? (
            socketActiveUsers.map((user) => (
              <li key={user._id} onClick={() => handleChat(user._id, "user")}>
                <img src={user.profilePicture || "/default-avatar.png"} alt="dp" width="30" height="30" style={{ borderRadius: "50%" }} />
                <span>{user.username}</span>
                <span className="blue-dot">🔵</span>
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
          {groups.length ? (
            groups.map((group) => (
              <li key={group._id} onClick={() => handleChat(group._id, "group")}>
                📢 {group.name}
              </li>
            ))
          ) : (
            <p>No groups available</p>
          )}
        </ul>
      </div>

      <div className="section">
        <h3>My Friends</h3>
        <ul>
          {friends.length ? (
            friends.map((friend) => (
              <li key={friend._id}>
                <img src={friend.profilePicture || "/default-avatar.png"} alt="dp" width="30" height="30" style={{ borderRadius: "50%" }} />
                <span>{friend.username}</span>
                <span>{friend.isActive ? "🔵" : "⚪"}</span>
              </li>
            ))
          ) : (
            <p>No friends yet</p>
          )}
        </ul>
      </div>

      <div className="section add-friend-container">
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



