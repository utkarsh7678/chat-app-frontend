import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../context/SocketContext';
import useStore from '../store/useStore';
import { isUserOnline } from '../utils/presence';
import "./dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || 'https://realtime-chat-api-z27k.onrender.com';

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { friends, groups, setFriends, setGroups, onlineUsers } = useStore();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [groupRes, friendsRes] = await Promise.all([
          axios.get(`${API_URL}/api/groups`, { headers }),
          axios.get(`${API_URL}/api/friends`, { headers }),
        ]);

        setGroups(groupRes.data);
        setFriends(friendsRes.data);
        
        // Only emit if socket exists
        if (socket) {
          socket.emit("user-online");
        }
      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, setFriends, setGroups, socket]);

  const handleAddFriend = async () => {
    if (!email.trim()) {
      alert("Please enter a valid email");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/friends/add-friend`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setEmail("");
      // Refresh friends list
      const friendsRes = await axios.get(`${API_URL}/api/friends`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setFriends(friendsRes.data);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddFriend();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to ChatApp Dashboard</h2>
        <div className="connection-status">
          Connection: {socket ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active Users Section */}
        <div className="dashboard-section active-users-section">
          <div className="section-header">
            <h3>🟢 Active Users</h3>
            <span className="user-count">{friends.filter(friend => isUserOnline(friend._id, onlineUsers)).length} online</span>
          </div>
          <div className="users-list">
            {friends.filter(friend => isUserOnline(friend._id, onlineUsers)).length > 0 ? (
              friends
                .filter(friend => isUserOnline(friend._id, onlineUsers))
                .map((user) => (
                  <div 
                    key={user._id} 
                    className="user-item active-user"
                    onClick={() => handleChat(user._id, "user")}
                  >
                    <div className="user-avatar">
                      <img 
                        src={user.profilePicture || "/default-avatar.png"} 
                        alt={user.username} 
                        className="avatar-img"
                      />
                      <div className="online-indicator"></div>
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="status">🟢 Online</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="empty-state">
                <p>No active users</p>
              </div>
            )}
          </div>
        </div>

        {/* Friends Section */}
        <div className="dashboard-section friends-section">
          <div className="section-header">
            <h3>👥 My Friends</h3>
            <span className="user-count">{friends.length} total</span>
          </div>
          <div className="users-list">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div 
                  key={friend._id} 
                  className={`user-item ${isUserOnline(friend._id, onlineUsers) ? 'active-user' : 'inactive-user'}`}
                  onClick={() => handleChat(friend._id, "user")}
                >
                  <div className="user-avatar">
                    <img 
                      src={friend.profilePicture || "/default-avatar.png"} 
                      alt={friend.username} 
                      className="avatar-img"
                    />
                    <div className={`status-indicator ${isUserOnline(friend._id, onlineUsers) ? 'online' : 'offline'}`}></div>
                  </div>
                  <div className="user-info">
                    <span className="username">{friend.username}</span>
                    <span className="status">
                      {isUserOnline(friend._id, onlineUsers) ? "🟢 Online" : "⚪ Offline"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No friends yet</p>
                <p className="empty-hint">Add friends to start chatting!</p>
              </div>
            )}
          </div>
        </div>

        {/* Groups Section */}
        <div className="dashboard-section groups-section">
          <div className="section-header">
            <h3>📢 Groups</h3>
            <span className="user-count">{groups.length} groups</span>
          </div>
          <div className="groups-list">
            {groups.length > 0 ? (
              groups.map((group) => (
                <div 
                  key={group._id} 
                  className="group-item"
                  onClick={() => handleChat(group._id, "group")}
                >
                  <div className="group-avatar">
                    <img 
                      src={group.avatar || "/default-group-avatar.png"} 
                      alt={group.name} 
                      className="avatar-img"
                    />
                  </div>
                  <div className="group-info">
                    <span className="group-name">{group.name}</span>
                    <span className="member-count">{group.members?.length || 0} members</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No groups yet</p>
                <p className="empty-hint">Create or join groups to start group chats!</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Friend Section */}
        <div className="dashboard-section add-friend-section">
          <div className="section-header">
            <h3>➕ Add Friend</h3>
          </div>
          <div className="add-friend-form">
            <input
              type="email"
              placeholder="Enter friend's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="email-input"
            />
            <button onClick={handleAddFriend} className="add-friend-btn">
              Add Friend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;






