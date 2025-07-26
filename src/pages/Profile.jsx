import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import useStore from '../store/useStore';
import { user as userApi  } from '../services/api';
import Avatar from '../components/Avatar';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username should be of minimum 3 characters length')
    .required('Username is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  bio: yup.string().max(500, 'Bio should not exceed 500 characters'),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug logging for avatar
  useEffect(() => {
    console.log('🔍 Profile Debug:');
    console.log('User:', user);
    console.log('Profile Picture Data:', user?.profilePicture);
    console.log('Has profilePicture:', !!user?.profilePicture?.versions);
    console.log('Avatar Versions:', user?.profilePicture?.versions);
    console.log('API URL:', import.meta.env.VITE_API_URL);
  }, [user]);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await userApi.updateProfile(values);
        setUser(response.data.user);
        setSuccess('Profile updated successfully');
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        setSuccess('');
      }
    },
  });

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Basic file validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Use the updateAvatar function from the store
      const updateAvatar = useStore.getState().updateAvatar;
      const result = await updateAvatar(formData);
      
      console.log("Avatar uploaded successfully:", result);
      setSuccess('Avatar updated successfully!');
      
      // Clear the file input
      event.target.value = '';
      
      // Update the local user state with the new avatar
      setUser({
        ...user,
        profilePicture: {
          versions: result.profilePicture.versions,
          publicId: result.profilePicture.publicId,
          lastUpdated: new Date()
        }
      });
      
    } catch (err) {
      console.error('Avatar upload error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to upload avatar. Please try again.';
      
      if (err.message.includes('Network error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('authentication')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.message.includes('No avatar file')) {
        errorMessage = 'Please select a file to upload.';
      } else if (err.message.includes('HTTP 413')) {
        errorMessage = 'File is too large. Please select a smaller image (max 5MB).';
      } else if (err.message.includes('HTTP 415')) {
        errorMessage = 'Unsupported file type. Please select a JPEG, PNG, GIF, or WebP image.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ position: 'relative', mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              profilePicture={user?.profilePicture}
              alt={user?.username || 'User Avatar'}
              size="large"
              sx={{ 
                width: 120, 
                height: 120,
                mb: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: 3
              }}
            />
            <input
              accept="image/jpeg, image/png, image/gif, image/webp"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
              disabled={loading}
            />
            <label htmlFor="avatar-upload">
              <Button
                variant="outlined"
                color="primary"
                component="span"
                startIcon={<PhotoCamera />}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? 'Uploading...' : 'Change Avatar'}
              </Button>
            </label>
            
            {/* Show file requirements */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              JPG, PNG, GIF, or WebP. Max 5MB.
            </Typography>
            
            {/* Error and success messages */}
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {success}
              </Typography>
            )}
          </Box>

          <Typography component="h1" variant="h5">
            Profile
          </Typography>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              id="bio"
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={formik.values.bio}
              onChange={formik.handleChange}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              helperText={formik.touched.bio && formik.errors.bio}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" sx={{ mt: 2 }}>
                {success}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update Profile
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 
