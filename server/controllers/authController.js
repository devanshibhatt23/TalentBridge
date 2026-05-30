// ============================================
// AUTH CONTROLLER — Registration & Login Logic
// ============================================
// Controllers contain the BUSINESS LOGIC for each route.
// Routes just define URLs → controllers do the actual work.
//
// YOUR DIAGRAM FLOW:
// 1. REGISTER: User fills form → Backend gets {name, email, password, role}
//    → password is hashed (handled by User model's pre-save hook)
//    → stored in User Table/Collection
//
// 2. LOGIN: User sends {email, password}
//    → "Table pe search karo with unique email"
//    → "Check the hashed pw with stored pw"
//    → If match → return JWT token
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// REGISTER — Create a new account
// ============================================
// POST /api/auth/register
// Body: { name, email, password, role, phone, company (if recruiter) }
// ============================================
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, company } = req.body;

    // --- Validation ---
    // Check all required fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role.',
      });
    }

    // Check if role is valid
    if (!['recruiter', 'candidate'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "recruiter" or "candidate".',
      });
    }

    // Recruiters must provide a company name
    if (role === 'recruiter' && !company) {
      return res.status(400).json({
        success: false,
        message: 'Recruiters must provide a company name.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('[AUTH] Register request', {
      name: name.trim(),
      email: normalizedEmail,
      role,
      phone,
      company: role === 'recruiter' ? company : undefined,
    });

    // Check if a user with this email already exists
    // YOUR DIAGRAM: email is "unique" in the table
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // --- Create the user ---
    // The password will be automatically hashed by the pre-save hook in User model
    // YOUR DIAGRAM: "password → salt (random word jo add hoga), hashing"
    const user = await User.create({
      name,
      email: normalizedEmail,
      password, // will be hashed automatically!
      role,
      phone,
      company: role === 'recruiter' ? company : undefined,
    });

    // --- Generate JWT token ---
    // We store userId and role in the token so we know who they are later
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token expires in 7 days
    );

    // --- Send response ---
    // Note: we don't send the password back (it's excluded by select: false in the model)
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

// ============================================
// LOGIN — Authenticate and get a token
// ============================================
// POST /api/auth/login
// Body: { email, password }
//
// YOUR DIAGRAM:
// "Login req for (email) and this (pw)"
// → "{ email, hashed pw }"
// → "Table pe search karo with unique email, check the hashed pw with stored pw"
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('[AUTH] Login request', { email: normalizedEmail });

    // --- Find user by email ---
    // YOUR DIAGRAM: "Table pe search karo with unique email"
    // We need .select('+password') because we set select: false in the model
    // (normally password is excluded from queries for security)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        // We say "email or password" instead of "email not found"
        // so attackers can't figure out which emails exist
      });
    }

    // --- Compare passwords ---
    // YOUR DIAGRAM: "check the hashed pw with stored pw"
    // user.comparePassword() was defined in the User model
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // --- Generate JWT token ---
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // --- Send response ---
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

// ============================================
// GET ME — Get currently logged-in user's info
// ============================================
// GET /api/auth/me
// This route is protected — requires auth middleware
// The frontend calls this on page load to check if the user is still logged in
// ============================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware (it already found the user)
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE PROFILE — Update candidate/recruiter profile
// ============================================
// PUT /api/auth/profile
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { name, phone, company, profile } = req.body;
    
    // Find the current user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (user.role === 'recruiter' && company) user.company = company;

    // Update profile fields
    if (profile) {
      if (!user.profile) user.profile = {};
      
      const allowedProfileFields = ['headline', 'bio', 'experience', 'education', 'location'];
      allowedProfileFields.forEach(field => {
        if (profile[field] !== undefined) {
          user.profile[field] = profile[field];
        }
      });
      
      // Handle skills array separately
      if (profile.skills && Array.isArray(profile.skills)) {
        user.profile.skills = profile.skills.map(s => s.trim()).filter(Boolean);
      } else if (typeof profile.skills === 'string') {
        user.profile.skills = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile.',
      error: error.message,
    });
  }
};

// ============================================
// UPLOAD AVATAR
// ============================================
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    user.avatar = dataUri;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar.',
      error: error.message,
    });
  }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar };
