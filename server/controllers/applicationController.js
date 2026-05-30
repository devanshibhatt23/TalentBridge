const Application = require('../models/Application');
const Job = require('../models/Job');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

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

    // Build resume payload if a PDF was uploaded
    const resumePayload = req.file
      ? {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size,
          data: req.file.buffer,
          uploadedAt: new Date(),
        }
      : undefined;

    let matchScore = undefined;
    
    console.log('[DEBUG] applyToJob - req.file received:', !!req.file, 'mimetype:', req.file?.mimetype);

    if (req.file && req.file.mimetype === 'application/pdf') {
      try {
        console.log('[DEBUG] applyToJob - Parsing PDF...');
        // Parse PDF content
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;
        console.log(`[DEBUG] applyToJob - PDF parsed successfully. Extracted text length: ${resumeText.length}`);

        // Construct AI prompt
        const prompt = `
          You are an expert technical recruiter. Evaluate the following resume against the given job description and requirements.
          Calculate a matching score from 0 to 100 representing how well the candidate's skills and experience match the job.
          Provide ONLY the numeric score as your response (e.g., 85), nothing else.

          Job Title: ${job.title}
          Job Description: ${job.description}
          Job Requirements: ${job.requirements}
          Skills Needed: ${job.skills.join(', ')}

          Resume:
          ${resumeText}
        `;

        // Initialize Google AI SDK
        console.log('[DEBUG] applyToJob - Initializing Google GenAI and calling gemini-2.5-flash...');
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        // Parse the numeric score
        const generatedText = aiResponse.text.trim();
        console.log('[DEBUG] applyToJob - Google GenAI raw response text:', generatedText);
        
        const score = parseInt(generatedText.replace(/[^0-9]/g, ''), 10);
        console.log('[DEBUG] applyToJob - Parsed score from text:', score);
        
        if (!isNaN(score) && score >= 0 && score <= 100) {
          matchScore = score;
          console.log('[DEBUG] applyToJob - matchScore set successfully to:', matchScore);
        } else {
          console.warn('[DEBUG] applyToJob - Parsed score is invalid (NaN or out of bounds).');
        }
      } catch (aiError) {
        console.error('Error generating AI match score:', aiError);
        // Continue without score if AI fails
      }
    }

    // Create the application
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      resume: resumePayload,
      matchScore,
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
      .select('-resume.data')
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
      .select('-resume.data')
      .populate('candidate', 'name email profile')
      .sort({ matchScore: -1, createdAt: -1 });

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

    // Real-time notification (Socket.IO): push status changes instantly
    try {
      const { getIO, userRoom } = require('../socket');
      const io = getIO();

      io.to(userRoom(req.user._id.toString())).emit('application:statusChanged', {
        applicationId: application._id,
        jobId: application.job?._id,
        candidateId: application.candidate,
        status: application.status,
        changedBy: req.user._id,
        changedAt: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      });

      io.to(userRoom(application.candidate.toString())).emit('application:statusChanged', {
        applicationId: application._id,
        jobId: application.job?._id,
        candidateId: application.candidate,
        status: application.status,
        changedBy: req.user._id,
        changedAt: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      });
    } catch (socketErr) {
      // If Socket.IO isn't available, we still succeed via HTTP.
      console.warn('Socket notification failed:', socketErr?.message || socketErr);
    }

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

const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (req.user.role === 'recruiter') {
      if (application.job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only download resumes for jobs you posted.',
        });
      }
    } else if (req.user.role === 'candidate') {
      if (application.candidate.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only download your own resume.',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    if (!application.resume || !application.resume.data) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found for this application.',
      });
    }

    res.setHeader('Content-Type', application.resume.contentType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${application.resume.filename || 'resume.pdf'}"`,
    );
    res.send(application.resume.data);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading resume.',
      error: error.message,
    });
  }
};

// ============================================
// GET RESUME INFO — Get resume metadata without data
// ============================================
// GET /api/applications/:id/resume-info
// ============================================
const getResumeInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Check access permissions
    if (req.user.role === 'recruiter') {
      if (application.job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only view resume info for jobs you posted.',
        });
      }
    } else if (req.user.role === 'candidate') {
      if (application.candidate.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own resume info.',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    if (!application.resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found for this application.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        resume: {
          filename: application.resume.filename,
          contentType: application.resume.contentType,
          size: application.resume.size,
          uploadedAt: application.resume.uploadedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get resume info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resume info.',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE RESUME — Candidate updates their resume for an application
// ============================================
// PUT /api/applications/:id/resume
// Only candidates can update their own resume
// ============================================
const updateResume = async (req, res) => {
  try {
    const { id } = req.params;

    // Only candidates can update resume
    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can update their resume.',
      });
    }

    // Must have a file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required.',
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Verify the candidate owns this application
    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own resume.',
      });
    }

    // Update the resume
    application.resume = {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedAt: new Date(),
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully!',
      data: {
        application: {
          _id: application._id,
          resume: {
            filename: application.resume.filename,
            contentType: application.resume.contentType,
            size: application.resume.size,
            uploadedAt: application.resume.uploadedAt,
          },
        },
      },
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resume.',
      error: error.message,
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  downloadResume,
  getResumeInfo,
  updateResume,
};
