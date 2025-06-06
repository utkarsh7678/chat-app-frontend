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
import { auth } from '../services/api';

const emailValidationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const otpValidationSchema = yup.object({
  otp: yup
    .string()
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
  newPassword: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState('');

  const emailFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await auth.sendResetPasswordOtp(values.email);
        setEmail(values.email);
        setShowOtpInput(true);
        setSuccess('OTP has been sent to your email address.');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await auth.verifyResetPasswordOtp({
          email,
          otp: values.otp,
          newPassword: values.newPassword,
        });
        setSuccess('Password has been reset successfully');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      } finally {
        setLoading(false);
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
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              We've sent a 6-digit OTP to your email address. Please enter it below along with your new password.
            </Typography>
            <Box
              component="form"
              onSubmit={otpFormik.handleSubmit}
              sx={{ mt: 1, width: '100%' }}
            >
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
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={otpFormik.values.newPassword}
                onChange={otpFormik.handleChange}
                error={otpFormik.touched.newPassword && Boolean(otpFormik.errors.newPassword)}
                helperText={otpFormik.touched.newPassword && otpFormik.errors.newPassword}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={otpFormik.values.confirmPassword}
                onChange={otpFormik.handleChange}
                error={otpFormik.touched.confirmPassword && Boolean(otpFormik.errors.confirmPassword)}
                helperText={otpFormik.touched.confirmPassword && otpFormik.errors.confirmPassword}
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
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setShowOtpInput(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Back to Email Input
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
            Forgot Password
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Enter your email address and we'll send you an OTP to reset your password.
          </Typography>
          <Box
            component="form"
            onSubmit={emailFormik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
              helperText={emailFormik.touched.email && emailFormik.errors.email}
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 