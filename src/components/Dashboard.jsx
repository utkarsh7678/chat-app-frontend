import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../context/SocketContext';
import useStore from '../store/useStore';
import { isUserOnline } from '../utils/presence';
import "./dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Dashboard = () => {
  // State and hooks at the top level
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // All hooks at the top level
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { 
    friends, 
    groups, 
    setFriends, 
    setGroups, 
    onlineUsers, 
    user, 
    token: storeToken, 
    isAuthenticated 
  } = useStore();
  
  const authToken = localStorage.getItem("token");
  
  // Derived values will be used in the component
  // These are defined at the top to maintain hook rules

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${authToken}` };

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
  }, [navigate, setFriends, setGroups, socket, authToken]);

  const handleAddFriend = async () => {
    if (!email.trim()) {
      alert("Please enter a valid email");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/friends/add-friend`,
        { email },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      alert(res.data.message);
      setEmail("");
      // Refresh friends list
      const friendsRes = await axios.get(`${API_URL}/api/friends`, { 
        headers: { Authorization: `Bearer ${authToken}` } 
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

  // Fetch user data if not available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authToken) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.user) {
          useStore.getState().setUser(response.data.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!user && authToken) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [user, authToken, navigate]);
  
  // Handle initial data loading
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${authToken}` };

        const [groupRes, friendsRes] = await Promise.all([
          axios.get(`${API_URL}/api/groups`, { headers }),
          axios.get(`${API_URL}/api/friends`, { headers }),
        ]);

        setGroups(groupRes.data);
        setFriends(friendsRes.data);
        
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
  }, [authToken, navigate, setFriends, setGroups, socket]);
  
  // Show loading state if either loading or isLoading is true
  if (loading || isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }
  
  // Show error message if there was an error
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // Get profile picture URL and username with fallbacks
  const profilePictureUrl = user?.profilePicture?.url || "/default-avatar.png";
  const username = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-profile">
          <div className="user-info">
            <h2>Welcome back, {username}!</h2>
            <div className="connection-status">
              Status: {socket ? "🟢 Online" : "🔴 Offline"}
            </div>
          </div>
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

