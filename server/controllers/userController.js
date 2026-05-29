const User = require('../models/User');

function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company,
    phone: u.phone,
  };
}

// GET /api/users/search
// Query params: keyword (searches name/email), role, company, page, limit
const searchUsers = async (req, res) => {
  try {
    const { keyword = '', role = '', company = '', page = 1, limit = 20 } = req.query;
    const meId = req.user._id.toString();

    // Build filter
    const filter = {};

    // Exclude current user
    filter._id = { $ne: req.user._id };

    // Search by keyword (name or email)
    if (keyword.trim()) {
      const searchRegex = new RegExp(keyword.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // Filter by role
    if (role && ['recruiter', 'candidate'].includes(role)) {
      filter.role = role;
    }

    // Filter by company
    if (company.trim()) {
      const companyRegex = new RegExp(company.trim(), 'i');
      filter.company = companyRegex;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const users = await User.find(filter)
      .select('name email role company phone')
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(normalizeUser),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users.',
      error: error.message,
    });
  }
};

module.exports = {
  searchUsers,
};
