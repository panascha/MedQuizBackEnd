const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

async function sendEmail({ to, subject, text }) {
  await transporter.sendMail({
    from: `MSEB-QUIZ <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
