// Vercel serverless function – no external dependencies needed if using built‑in fetch/SendGrid, 
// but here we use Nodemailer for SMTP. Add nodemailer to your package.json.
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Basic server‑side validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create transporter (using Gmail SMTP – set env vars in Vercel)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: 'shuraasura8@gmail.com',
    subject: `New message from ${name} via negusX portfolio`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
    html: `<p><strong>${name}</strong> (${email})</p><p>Phone: ${phone}</p><p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

