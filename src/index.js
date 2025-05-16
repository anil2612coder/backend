const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email template function
const createEmailTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #7A35C1; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #7A35C1; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Talent Application</h1>
          <p>Maxtron Innovation</p>
        </div>
        <div class="content">
          <div class="section">
            <h2>Personal Information</h2>
            <p><span class="label">Name:</span> ${formData.firstName} ${formData.lastName}</p>
            <p><span class="label">Email:</span> ${formData.email}</p>
            <p><span class="label">Phone:</span> ${formData.phone}</p>
          </div>
          
          <div class="section">
            <h2>Professional Details</h2>
            <p><span class="label">Area of Interest:</span> ${formData.areaOfInterest}</p>
            <p><span class="label">Experience Level:</span> ${formData.experienceLevel}</p>
          </div>
          
          <div class="section">
            <h2>Location</h2>
            <p><span class="label">City:</span> ${formData.city}</p>
            <p><span class="label">State:</span> ${formData.state}</p>
            <p><span class="label">Country:</span> ${formData.country}</p>
          </div>
          
          <div class="section">
            <h2>Communication Preferences</h2>
            <p><span class="label">Email Consent:</span> ${formData.consentEmail ? 'Yes' : 'No'}</p>
            <p><span class="label">SMS Consent:</span> ${formData.consentSMS ? 'Yes' : 'No'}</p>
          </div>
          
          <div class="section">
            <h2>Resume</h2>
            <p>A resume has been attached to this email.</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from Maxtron Innovation's Talent Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Routes
app.post('/sendTalentData', upload.single('resume'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      areaOfInterest,
      experienceLevel,
      city,
      state,
      country,
      consentEmail,
      consentSMS
    } = req.body;

    const formData = {
      firstName,
      lastName,
      email,
      phone,
      areaOfInterest,
      experienceLevel,
      city,
      state,
      country,
      consentEmail,
      consentSMS
    };

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_ADMIN,
      subject: `New Talent Application - ${firstName} ${lastName}`,
      html: createEmailTemplate(formData),
      attachments: req.file ? [{
        filename: req.file.originalname,
        path: req.file.path
      }] : []
    };

    await transporter.sendMail(mailOptions);

    // Send success response
    res.status(200).json({
      message: 'Form submitted successfully',
      data: {
        ...formData,
        resumeFile: req.file ? req.file.filename : null
      }
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({
      message: 'Error processing form submission',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      message: err.message
    });
  }
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 