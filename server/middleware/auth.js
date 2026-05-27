// ============================================
// AUTH MIDDLEWARE — JWT Token Verification
// ============================================
// This "middleware" runs BEFORE a route handler.
// It checks: "Does this request have a valid login token?"
//
// HOW IT WORKS:
// 1. The frontend sends a token in the request header: "Authorization: Bearer <token>"
// 2. This middleware extracts the token
// 3. jwt.verify() checks if the token is valid and not expired
// 4. If valid → attaches the user's info to the request and continues
// 5. If invalid → sends back a 401 "Unauthorized" error
//
// WHAT IS MIDDLEWARE?
// Think of it as a "security guard" that stands between the request
// and the route. The request must pass through the guard first.
//
// Flow: Request → [auth middleware] → Route Handler
//       If token OK:    ✅ → continues to route
//       If token bad:   ❌ → returns 401 error
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Step 1: Get the token from the request header
    // Headers look like: { Authorization: "Bearer eyJhbGciOiJI..." }
    const authHeader = req.headers.authorization;

    // Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // Extract just the token part (remove "Bearer " from the start)
    const token = authHeader.split(' ')[1];

    // Step 2: Verify the token
    // jwt.verify() decodes the token and checks:
    // - Was it signed with our secret key?
    // - Has it expired?
    // If valid, it returns the data we stored in the token (userId, role)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Find the user in the database
    // We stored the userId in the token when they logged in
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
      });
    }

    // Step 4: Attach user info to the request object
    // Now any route handler that runs after this middleware
    // can access req.user to know WHO is making the request
    req.user = user;

    // Step 5: Call next() to continue to the actual route handler
    // Without next(), the request would be stuck here forever
    next();
  } catch (error) {
    // If jwt.verify() fails (invalid or expired token)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = auth;
