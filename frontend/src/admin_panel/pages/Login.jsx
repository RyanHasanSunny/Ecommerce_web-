import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://18.212.65.1:5000/api/auth/login', { email, password });
      
      // Check if the user has an admin role
      if (response.data.role === 'admin') {
        localStorage.setItem('adminToken', response.data.token);  // Store token in localStorage
        navigate('/admin/dashboard');  // Navigate to the admin dashboard
      } else {
        setError('You do not have admin access');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <Typography variant="h4">Admin Login</Typography>
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </div>
  );
};

export default Login;
