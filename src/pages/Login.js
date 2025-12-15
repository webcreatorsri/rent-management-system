import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginUser } from '../utils/authHelpers';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Demo credentials
  const demoCredentials = {
    admin: {
      email: 'admin@rent.com',
      password: 'Admin@123'
    },
    manager: {
      email: 'manager@rent.com',
      password: 'Manager@123'
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    setErrorMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    setLoading(true);
    const result = await loginUser(formData.email, formData.password);
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error);
    }
    setLoading(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Renamed from useDemoCredentials to loadDemoCredentials
  const loadDemoCredentials = (type) => {
    setFormData({
      email: demoCredentials[type].email,
      password: demoCredentials[type].password
    });
    setErrors({});
    setErrorMessage('');
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            Rent Management System
          </Typography>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>

          {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Grid item>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
            </Grid>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Grid container spacing={1} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Button fullWidth variant="outlined" onClick={() => loadDemoCredentials('admin')}>
                  Admin Demo
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button fullWidth variant="outlined" onClick={() => loadDemoCredentials('manager')}>
                  Manager Demo
                </Button>
              </Grid>
            </Grid>

            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" underline="hover">
                    Register here
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;