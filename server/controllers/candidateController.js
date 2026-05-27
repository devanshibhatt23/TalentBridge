const User = require('../models/User');

// ============================================
// SEARCH CANDIDATES — Recruiter searches for candidates
// ============================================
// GET /api/candidates/search?keyword=react&location=bangalore
// ============================================
const searchCandidates = async (req, res) => {
  try {
    const { keyword, location, skills, page = 1, limit = 10 } = req.query;

    // Filter to only include candidates
    const filter = { role: 'candidate' };

    // Keyword search over name, headline, bio, skills
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { 'profile.headline': { $regex: keyword, $options: 'i' } },
        { 'profile.bio': { $regex: keyword, $options: 'i' } },
        { 'profile.skills': { $regex: keyword, $options: 'i' } },
      ];
    }

    // Location search
    if (location) {
      filter['profile.location'] = { $regex: location, $options: 'i' };
    }

    // Skills search
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      filter['profile.skills'] = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get the candidates matching the filter
    const [candidates, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -__v') // exclude sensitive/internal fields
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        candidates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCandidates: totalCount,
          hasNextPage: skip + candidates.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching candidates.',
      error: error.message,
    });
  }
};

// ============================================
// GET CANDIDATE BY ID — Full profile view
// ============================================
// GET /api/candidates/:id
// ============================================
const getCandidateById = async (req, res) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'candidate' })
      .select('-password -__v'); // exclude sensitive fields

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { candidate },
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching candidate profile.',
      error: error.message,
    });
  }
};

module.exports = {
  searchCandidates,
  getCandidateById,
};
