// ============================================
// ROLE CHECK MIDDLEWARE — Role-Based Access Control (RBAC)
// ============================================
// YOUR DIAGRAM: "Login - as recruiter or candidate (Role Based Access Control (RBAC))"
//
// This middleware checks if the logged-in user has the RIGHT ROLE
// to access a specific route.
//
// Example:
//   Only recruiters can post jobs → roleCheck('recruiter')
//   Only candidates can apply    → roleCheck('candidate')
//   Both can view jobs            → no roleCheck needed
//
// HOW TO USE:
//   router.post('/jobs', auth, roleCheck('recruiter'), createJob);
//   This means: first check auth (logged in?), then check role (recruiter?),
//   then finally run createJob.
//
// IMPORTANT: This middleware must be used AFTER the auth middleware,
// because it needs req.user to exist (which auth sets up).
// ============================================

const roleCheck = (...allowedRoles) => {
  // This is a "factory function" — it returns a middleware function
  // The (...allowedRoles) syntax means: accept any number of roles
  // e.g., roleCheck('recruiter') → allowedRoles = ['recruiter']
  // e.g., roleCheck('recruiter', 'candidate') → allowedRoles = ['recruiter', 'candidate']

  return (req, res, next) => {
    // req.user is set by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role check.',
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    // Role is allowed → continue to the route handler
    next();
  };
};

module.exports = roleCheck;
