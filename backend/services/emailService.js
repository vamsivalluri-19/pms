import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  try {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT, 10) || 587;
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    const config = {
      host,
      port,
      auth: { user, pass }
    };

    // Gmail special configuration
    if (host === 'smtp.gmail.com') {
      config.service = 'gmail';
      delete config.host;
      delete config.port;
    }

    transporter = nodemailer.createTransport(config);
    return transporter;
  } catch (error) {
    console.error('Nodemailer configuration error:', error);
    return null;
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const activeTransporter = getTransporter();
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;

    if (!activeTransporter || !user) {
      console.error('Email service is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.');
      return { success: false, error: 'Email service is not configured' };
    }

    const info = await activeTransporter.sendMail({
      from: `"PlaceTrack" <${user}>`,
      to,
      subject,
      html
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email send failure to ${to}:`, error.message);
    // Silent fallback to console.log in development
    console.log(`[EMAIL SIMULATION FALLBACK] To: ${to} | Subject: ${subject}`);
    return { success: false, error: error.message };
  }
};
