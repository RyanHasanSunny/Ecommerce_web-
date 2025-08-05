# 🔍 Server Debugging Guide for Auth System

## Quick Start Debugging Commands

### 1. Check Server Status
```bash
cd ecommerce-backend
npm start
```

### 2. Test Endpoints
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"user"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test profile (requires token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "x-auth-token: YOUR_JWT_TOKEN_HERE"
```

## Common Issues & Fixes

### Issue 1: Missing Import
**Problem**: getUserProfile function missing request import
**Fix**: Add `const { request } = require('express');` to authController.js

### Issue 2: Environment Variables
**Required .env variables**:
```
JWT_SECRET=your-secret-key-here
MONGO_URI=your-mongodb-connection-string
PORT=5000
```

### Issue 3: Dependencies
```bash
npm install express mongoose cors dotenv jsonwebtoken bcryptjs
```

## Debugging Steps
1. Check if MongoDB is running
2. Verify JWT_SECRET is set
3. Test endpoints with curl
4. Check console logs for errors
