import { useState } from 'react';
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
  console.log('🔍 Profile Debug:');
  console.log('User:', user);
  console.log('Has profilePicture:', !!user?.profilePicture);
  console.log('Avatar URL:', user?.profilePicture?.url);
  console.log('API URL:', import.meta.env.VITE_API_URL);
  if (user?.profilePicture?.url) {
    console.log('Full Avatar URL:', `${import.meta.env.VITE_API_URL}${user.profilePicture.url}`);
  }

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

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const updateAvatar = useStore.getState().updateAvatar;
      const result = await updateAvatar(formData);
      
      console.log("Avatar uploaded successfully:", result);
      setSuccess('Avatar updated successfully!');
      
      // Clear the file input
      event.target.value = '';
      
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
        errorMessage = 'File is too large. Please select a smaller image.';
      } else if (err.message.includes('HTTP 415')) {
        errorMessage = 'Unsupported file type. Please select a JPEG, PNG, or GIF image.';
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
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Avatar
              src={user?.profilePicture?.url ? `${import.meta.env.VITE_API_URL}${user.profilePicture.url}` : user?.avatar}
              alt={user?.username}
              sx={{ width: 100, height: 100 }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                color="primary"
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper',
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
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
