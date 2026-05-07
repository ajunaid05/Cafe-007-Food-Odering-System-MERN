const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const Owner = require('../models/Owner');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_me';

// User signup
router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Owner signup/registration
router.post('/owner/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if owner already exists
    const existing = await Owner.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Owner with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create owner
    const owner = await Owner.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Owner created successfully',
      owner: {
        id: owner._id,
        email: owner.email,
      },
    });
  } catch (error) {
    console.error('Owner signup error:', error);
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Owner with this email already exists',
        error: 'Duplicate email'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Owner login
router.post('/owner/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find owner by email (case insensitive)
    const owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Try bcrypt compare first (for hashed passwords)
    let isMatch = await bcrypt.compare(password, owner.password);
    
    // If bcrypt fails, check if password is stored as plain text (for migration)
    // This allows existing plain text passwords to work temporarily
    if (!isMatch && owner.password === password) {
      // Password is plain text - hash it and save for future logins
      console.log('Migrating plain text password to hashed for:', email);
      owner.password = await bcrypt.hash(password, 10);
      await owner.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: owner._id, role: 'owner' }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      owner: {
        id: owner._id,
        email: owner.email,
        role: 'owner',
      },
    });
  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User forgot password
router.post('/user/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, respond as if it worked
      return res.json({ message: 'If this email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email not configured!');
      console.log('📧 Reset token:', token);
      console.log('🔗 Reset URL:', resetUrl);
      console.log('');
      console.log('To enable email, add these to backend/.env:');
      console.log('  EMAIL_USER=your_email@gmail.com');
      console.log('  EMAIL_PASS=your_app_password');
      console.log('');
      return res.status(500).json({ 
        message: 'Email service not configured. Please contact the administrator.' 
      });
    }

    // Configure nodemailer for Gmail with proper settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Must be App Password for Gmail
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration before sending
    try {
      await transporter.verify();
      console.log('✅ Email server is ready to send messages');
    } catch (verifyError) {
      console.error('❌ Email server verification failed:', verifyError.message);
      console.error('Error code:', verifyError.code);
      console.log('');
      console.log('🔗 Reset URL (for manual use):', resetUrl);
      console.log('');
      
      return res.status(500).json({ 
        message: 'Email service error. Please check your email configuration or contact the administrator.'
      });
    }

    // Send email
    const mailOptions = {
      from: `"Food Ordering System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset - Food Ordering System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c7a878;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #c7a878; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666; background: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', user.email);

    res.json({ message: 'A password reset link has been sent to your email.' });
  } catch (error) {
    console.error('❌ Forgot password error:', error.message);
    console.error('Error code:', error.code);
    
    // Log the reset URL for admin use (only in console, not sent to frontend)
    if (user && user.resetPasswordToken) {
      console.log('🔗 Reset URL (admin only):', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${user.resetPasswordToken}`);
    }
    
    // Return appropriate error message
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION' || error.code === 'EENVELOPE') {
      return res.status(500).json({ 
        message: 'Email service error. Please contact support or try again later.'
      });
    }
    
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// User reset password
router.post('/user/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalid or expired' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


