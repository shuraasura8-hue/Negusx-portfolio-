// api/send-email.js
import nodemailer from 'nodemailer';

// Simple in-memory rate limiter (resets on cold start, good enough for portfolio)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5; // max 5 emails per IP per hour

function isRateLimited(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip);
  
  if (!userRequests) {
    rateLimit.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  if (now - userRequests.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  if (userRequests.count >= MAX_REQUESTS) {
    return true;
  }
  
  userRequests.count++;
  return false;
}

// Basic input sanitization — strip HTML tags
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
}

// Email format validation
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // or your exact domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  // Parse body safely
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { /* leave as string */ }
  }

  const { name, email, phone, message } = body || {};

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Sanitize inputs
  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanPhone = sanitize(phone || '');
  const cleanMessage = sanitize(message);

  // Length limits (prevent abuse)
  if (cleanName.length > 100 || cleanMessage.length > 2000) {
    return res.status(400).json({ error: 'Input too long' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    // FIXED: Use your own email as sender, put user's email in replyTo
    from: `"negusX Portfolio" <${process.env.EMAIL_USER}>`,
    replyTo: cleanEmail,
    to: process.env.EMAIL_USER,
    subject: `New message from ${cleanName}`,
    text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nPhone: ${cleanPhone}\n\nMessage:\n${cleanMessage}`,
    html: `
      <h3>New portfolio contact</h3>
      <p><strong>Name:</strong> ${cleanName}</p>
      <p><strong>Email:</strong> ${cleanEmail}</p>
      <p><strong>Phone:</strong> ${cleanPhone || 'Not provided'}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${cleanMessage.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}


