import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import useStore from '../store/useStore';
import { updateSettings } from '../services/api';

const validationSchema = yup.object({
  currentPassword: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .when('changePassword', {
      is: true,
      then: (schema) => schema.required('New password is required'),
    }),
  confirmPassword: yup
    .string()
    .when('changePassword', {
      is: true,
      then: (schema) =>
        schema
          .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
          .required('Confirm password is required'),
    }),
});

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      changePassword: false,
      emailNotifications: true,
      soundNotifications: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await updateSettings(values);
        setSuccess('Settings updated successfully');
        setError('');
        formik.resetForm();
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        setSuccess('');
      }
    },
  });

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
          <Typography component="h1" variant="h5">
            Settings
          </Typography>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  name="theme"
                />
              }
              label="Dark Mode"
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.emailNotifications}
                  onChange={formik.handleChange}
                  name="emailNotifications"
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.soundNotifications}
                  onChange={formik.handleChange}
                  name="soundNotifications"
                />
              }
              label="Sound Notifications"
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Change Password
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.changePassword}
                  onChange={formik.handleChange}
                  name="changePassword"
                />
              }
              label="Change Password"
            />

            {formik.values.changePassword && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  id="currentPassword"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.currentPassword &&
                    Boolean(formik.errors.currentPassword)
                  }
                  helperText={
                    formik.touched.currentPassword && formik.errors.currentPassword
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.newPassword &&
                    Boolean(formik.errors.newPassword)
                  }
                  helperText={
                    formik.touched.newPassword && formik.errors.newPassword
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                />
              </>
            )}

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
              Save Settings
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 