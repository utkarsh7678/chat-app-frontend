




import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../context/SocketContext';
import useStore from '../store/useStore';
import { isUserOnline } from '../utils/presence';
import "./dashboard.css";

// Icons
import { 
  People as PeopleIcon, 
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Add as AddIcon,
  NotificationsNone as NotificationsNoneIcon,
  MoreVert as MoreVertIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

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
    <div className="dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>ChatApp</h2>
          <div className="user-status">
            <span className={`status-indicator ${socket ? 'online' : 'offline'}`}></span>
            <span>{socket ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        <div className="sidebar-search">
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <PeopleIcon />
            <span>Friends</span>
          </button>
          <button className="nav-item">
            <GroupIcon />
            <span>Groups</span>
          </button>
          <button className="nav-item">
            <NotificationsNoneIcon />
            <span>Notifications</span>
          </button>
        </nav>

        <div className="user-profile">
          <img 
            src={user?.profilePicture?.url || '/default-avatar.png'} 
            alt={username} 
            className="profile-avatar"
          />
          <div className="profile-info">
            <span className="username">{username}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="settings-btn">
            <MoreVertIcon />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateGroup(true)}
            >
              <AddIcon /> Create Group
            </button>
            <button className="btn btn-icon">
              <NotificationsNoneIcon />
            </button>
            <button className="btn btn-icon" onClick={logout}>
              <LogoutIcon />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon friends">
              <PeopleIcon />
            </div>
            <div className="stat-info">
              <h3>{friends.length}</h3>
              <p>Friends</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon groups">
              <GroupIcon />
            </div>
            <div className="stat-info">
              <h3>{groups.length}</h3>
              <p>Groups</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon online">
              <CheckCircleIcon />
            </div>
            <div className="stat-info">
              <h3>{friends.filter(friend => isUserOnline(friend._id, onlineUsers)).length}</h3>
              <p>Online Now</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Active Users Section */}
          <div className="content-section">
            <div className="section-header">
              <h2>Active Now</h2>
              <span className="badge">{friends.filter(friend => isUserOnline(friend._id, onlineUsers)).length} online</span>
            </div>
            <div className="user-list">
              {friends.filter(friend => isUserOnline(friend._id, onlineUsers)).length > 0 ? (
                friends
                  .filter(friend => isUserOnline(friend._id, onlineUsers))
                  .map((user) => (
                    <div 
                      key={user._id} 
                      className="user-card active"
                      onClick={() => handleChat(user._id, "user")}
                    >
                      <div className="user-avatar">
                        <img 
                          src={user.profilePicture?.url || "/default-avatar.png"} 
                          alt={user.username} 
                        />
                        <span className="status-indicator online"></span>
                      </div>
                      <div className="user-details">
                        <h4>{user.username}</h4>
                        <p>Active now</p>
                      </div>
                      <button className="chat-btn">
                        <span className="material-icons">chat_bubble</span>
                      </button>
                    </div>
                  ))
              ) : (
                <div className="empty-state">
                  <CircleIcon className="empty-icon" />
                  <p>No active users</p>
                  <small>When friends are active, they'll appear here</small>
                </div>
              )}
            </div>
          </div>

          {/* Recent Chats Section */}
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Chats</h2>
              <button className="btn-text">See all</button>
            </div>
            <div className="chat-list">
              {friends.length > 0 ? (
                friends.slice(0, 3).map((friend) => (
                  <div 
                    key={friend._id} 
                    className={`chat-item ${isUserOnline(friend._id, onlineUsers) ? 'online' : ''}`}
                    onClick={() => handleChat(friend._id, "user")}
                  >
                    <div className="chat-avatar">
                      <img 
                        src={friend.profilePicture?.url || "/default-avatar.png"} 
                        alt={friend.username} 
                      />
                      <span className={`status-indicator ${isUserOnline(friend._id, onlineUsers) ? 'online' : 'offline'}`}></span>
                    </div>
                    <div className="chat-info">
                      <h4>{friend.username}</h4>
                      <p className="last-message">Tap to start chatting</p>
                    </div>
                    <div className="chat-meta">
                      <span className="time">Now</span>
                      {isUserOnline(friend._id, onlineUsers) && (
                        <span className="unread-count">1</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <PeopleIcon className="empty-icon" />
                  <p>No friends yet</p>
                  <small>Add friends to start chatting</small>
                </div>
              )}
            </div>
          </div>

          {/* Groups Section */}
          <div className="content-section">
            <div className="section-header">
              <h2>Your Groups</h2>
              <button 
                className="btn-text"
                onClick={() => setShowCreateGroup(true)}
              >
                Create New
              </button>
            </div>
            <div className="group-list">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <div 
                    key={group._id} 
                    className="group-card"
                    onClick={() => handleChat(group._id, "group")}
                  >
                    <div className="group-avatar">
                      <img 
                        src={group.avatar || "/default-group-avatar.png"} 
                        alt={group.name} 
                      />
                    </div>
                    <div className="group-info">
                      <h4>{group.name}</h4>
                      <p>{group.members?.length || 0} members • {group.lastMessage || 'No messages yet'}</p>
                    </div>
                    <div className="group-actions">
                      <button className="btn-icon">
                        <MoreVertIcon />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <GroupIcon className="empty-icon" />
                  <p>No groups yet</p>
                  <small>Create a group to start chatting with multiple friends</small>
                </div>
              )}
            </div>
          </div>

          {/* Add Friend Section */}
          <div className="content-section">
            <div className="section-header">
              <h2>Add Friend</h2>
            </div>
            <div className="add-friend-card">
              <div className="search-container">
                <SearchIcon className="search-icon" />
                <input
                  type="email"
                  placeholder="Enter friend's email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="search-input"
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleAddFriend}
                disabled={!email.trim()}
              >
                <PersonAddIcon /> Add Friend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Group</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateGroup(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="What's this group about?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Add Members</label>
                {friends.length > 0 ? (
                  <div className="member-selection">
                    {friends.map(friend => (
                      <div 
                        key={friend._id} 
                        className={`member-item ${selectedFriends.includes(friend._id) ? 'selected' : ''}`}
                        onClick={() => toggleFriendSelection(friend._id)}
                      >
                        <img 
                          src={friend.profilePicture?.url || '/default-avatar.png'} 
                          alt={friend.username} 
                          className="member-avatar"
                        />
                        <span className="member-name">{friend.username}</span>
                        {selectedFriends.includes(friend._id) ? (
                          <CheckCircleIcon className="check-icon" />
                        ) : (
                          <div className="empty-check"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <PeopleIcon className="empty-icon" />
                    <p>No friends to add</p>
                    <small>Add friends first to create a group</small>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
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
    </div>
  );
};

export default Dashboard;
