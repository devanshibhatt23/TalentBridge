const Application = require('../models/Application');
const Job = require('../models/Job');

// ============================================
// APPLY TO JOB — Candidate applies to a job
// ============================================
// POST /api/applications
// Body: { jobId, coverLetter }
// ============================================
const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required.',
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Check if job is closed
    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications.',
      });
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job.',
      });
    }

    // Create the application
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      statusHistory: [
        {
          status: 'applied',
          changedBy: req.user._id,
          note: 'Initial application submitted',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Successfully applied to the job!',
      data: { application },
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    // Handle MongoDB duplicate key error for compound index just in case
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'You have already applied to this job.',
        });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while applying to job.',
      error: error.message,
    });
  }
};

// ============================================
// GET MY APPLICATIONS — Candidate views their applications
// ============================================
// GET /api/applications/my-applications
// ============================================
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        select: 'title company location status deadline',
        populate: {
          path: 'postedBy',
          select: 'name email company',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { applications, count: applications.length },
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your applications.',
      error: error.message,
    });
  }
};

// ============================================
// GET JOB APPLICATIONS — Recruiter views applications for their job
// ============================================
// GET /api/applications/job/:jobId
// ============================================
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and belongs to the recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for jobs you posted.',
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'name email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { applications, count: applications.length },
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job applications.',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE APPLICATION STATUS — Recruiter updates candidate status
// ============================================
// PUT /api/applications/:id/status
// Body: { status, note }
// ============================================
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided.',
      });
    }

    let application = await Application.findById(id).populate('job');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Verify the logged-in recruiter owns the job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for jobs you posted.',
      });
    }

    // Update status and add to status history (Audit Trail)
    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status updated to ${status}`
    });

    // Mongoose optimistic concurrency will automatically check the version on save
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: { application },
    });
  } catch (error) {
    console.error('Update application status error:', error);
    
    // Handle concurrency version error
    if (error.name === 'VersionError') {
      return res.status(409).json({
        success: false,
        message: 'The application was updated by someone else recently. Please refresh and try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating application status.',
      error: error.message,
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};
