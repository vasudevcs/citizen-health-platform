const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp, purpose) {
  const subjectMap = {
    login: 'Your login OTP',
    verify: 'Verify your account',
    reset: 'Your password reset OTP',
  };
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@citizenhealth.gov',
      to,
      subject: subjectMap[purpose] || 'Your OTP code',
      html: `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes. Do not share this code with anyone.</p>`,
    });
  } catch (error) {
    console.warn(`[SMTP-ERROR] Failed to send email to ${to}: ${error.message}`);
    console.log(`[DEV-FALLBACK] OTP for ${to} (${purpose}): ${otp}`);
  }
}

async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@citizenhealth.gov',
      to,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes. If you did not request this, ignore this email.</p>`,
    });
  } catch (error) {
    console.warn(`[SMTP-ERROR] Failed to send password reset email to ${to}: ${error.message}`);
    console.log(`[DEV-FALLBACK] Password reset URL for ${to}: ${resetUrl}`);
  }
}

// SMS placeholder - swap in Twilio/MSG91 etc. when ready
async function sendOtpSms(phone, otp) {
  console.log(`[SMS-PLACEHOLDER] OTP ${otp} would be sent to ${phone}`);
  return true;
}

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendOtpSms };
