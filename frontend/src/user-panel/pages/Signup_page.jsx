import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Using useNavigate for routing in react-router-dom v6
import { registerUser } from '../../user-panel/api/api'; // Import the registerUser function

const SignupPage = () => {
  const navigate = useNavigate();  // useNavigate hook
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');  // Default to regular user
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Call the registerUser API function from the imported api.js
      const response = await registerUser({
        name,
        email,
        password,
        role
      });
      
      if (response.msg === 'User registered successfully') {
        navigate('/login'); // Redirect to login page after successful registration
      }
    } catch (err) {
      // Error handling based on backend response
      if (err.response && err.response.data) {
        setError(err.response.data.msg || 'Error creating account');
      } else {
        setError('Server error');
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default SignupPage;
