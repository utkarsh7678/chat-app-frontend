



import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../context/SocketContext';
import useStore from '../store/useStore';
import { isUserOnline } from '../utils/presence';
import "./dashboard.css";

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Default avatar images
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
const DEFAULT_GROUP_AVATAR = 'https://cdn-icons-png.flaticon.com/512/2472/2472066.png';

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupDescription, setGroupDescription] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    logout 
  } = useStore();
  
  const authToken = storeToken || localStorage.getItem("token");

  // Fetch initial data
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

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/groups`,
        {
          name: groupName,
          description: groupDescription,
          isPrivate: false,
          members: selectedFriends
        },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          } 
        }
      );

      if (response.data.success) {
        // Refresh groups list
        const groupRes = await axios.get(`${API_URL}/api/groups`, { 
          headers: { Authorization: `Bearer ${authToken}` } 
        });
        setGroups(groupRes.data);
        
        // Reset form
        setGroupName('');
        setGroupDescription('');
        setSelectedFriends([]);
        setShowCreateGroup(false);
        
        alert('Group created successfully!');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert(err.response?.data?.error || 'Failed to create group');
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Fetch user data if not available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authToken) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    if (!user && authToken) {
      fetchUserData();
    } else {
      setLoading(false);
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
  
  // Handle authentication and redirect
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Show loading state while data is being fetched or user is not loaded
  if (loading || !user) {
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

  // Get profile picture URL and username with fallbacks
  const profilePictureUrl = user?.profilePicture?.url || "/default-avatar.png";
  const username = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard-container">
      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay">
          <div className="create-group-modal">
            <h3>Create New Group</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Group Description (Optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="form-input"
                rows="3"
              />
            </div>
            <div className="friends-selection">
              <h4>Select Members</h4>
              {friends.length > 0 ? (
                <div className="friends-list">
                  {friends.map(friend => (
                    <div 
                      key={friend._id} 
                      className={`friend-item ${selectedFriends.includes(friend._id) ? 'selected' : ''}`}
                      onClick={() => toggleFriendSelection(friend._id)}
                    >
                      <img 
                        src={friend.profilePicture?.url || '/default-avatar.png'} 
                        alt={friend.username} 
                        className="friend-avatar"
                      />
                      <span>{friend.username}</span>
                      {selectedFriends.includes(friend._id) && (
                        <span className="checkmark">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No friends to add to group</p>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateGroup(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedFriends.length === 0}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
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
      <div className="dashboard-actions">
        <button 
          className="btn btn-primary create-group-btn"
          onClick={() => setShowCreateGroup(true)}
        >
          + Create Group
        </button>
      </div>
      <div className="dashboard-grid">
        {/* Active Users Section */}
        <div className="dashboard-section active-users-section">
          <div className="section-header">
            <h3><span style={{color: '#4caf50'}}>•</span> Active Users</h3>
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
            <h3><PeopleIcon style={{verticalAlign: 'middle', marginRight: '5px'}} /> Friends</h3>
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
            <h3><GroupIcon style={{verticalAlign: 'middle', marginRight: '5px'}} /> Groups</h3>
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
