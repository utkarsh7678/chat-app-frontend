import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import useStore from '../store/useStore';
import { auth } from '../services/api';
import { uploadAvatar } from '../services/api';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username should be of minimum 3 characters length')
    .required('Username is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const otpValidationSchema = yup.object({
  otp: yup
    .string()
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        // First, check if email exists and send OTP
        await auth.sendRegistrationOtp(values.email);
        setRegistrationData(values);
        setShowOtpInput(true);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response?.status === 400 && err.response?.data?.error?.includes('already used')) {
          setError('This email is already registered. Please use a different email or try logging in.');
        } else {
          setError(err.response?.data?.error || 'An error occurred');
        }
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        // Prepare FormData for registration with avatar
        const formData = new FormData();
        formData.append('username', registrationData.username);
        formData.append('email', registrationData.email);
        formData.append('password', registrationData.password);
        formData.append('otp', values.otp);
        if (avatar) {
          formData.append('avatar', avatar);
        }
        // Send registration request with avatar
        const response = await auth.register(formData);
        setUser(response.data.user);
        setToken(response.data.token);
        navigate('/chat');
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      }
    },
  });

  if (showOtpInput) {
    return (
      <Container component="main" maxWidth="xs">
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
            <Typography component="h1" variant="h5">
              Verify Your Email
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              We've sent a 6-digit OTP to your email address. Please enter it below to complete your registration.
            </Typography>
            <Box
              component="form"
              onSubmit={otpFormik.handleSubmit}
              sx={{ mt: 1, width: '100%' }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={e => setAvatar(e.target.files[0])}
                style={{ margin: '16px 0' }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="Enter OTP"
                name="otp"
                autoComplete="off"
                autoFocus
                value={otpFormik.values.otp}
                onChange={otpFormik.handleChange}
                error={otpFormik.touched.otp && Boolean(otpFormik.errors.otp)}
                helperText={otpFormik.touched.otp && otpFormik.errors.otp}
              />
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP & Register'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setShowOtpInput(false);
                  setError('');
                }}
              >
                Back to Registration
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
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
          <Typography component="h1" variant="h5">
            Sign up
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
              autoFocus
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
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 