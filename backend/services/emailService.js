import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  try {
    const host = process.env.EMAIL_HOST || 'smtp.mailtrap.io';
    const port = parseInt(process.env.EMAIL_PORT) || 2525;
    const user = process.env.EMAIL_USER || '';
    const pass = process.env.EMAIL_PASS || '';

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
    if (!activeTransporter || !process.env.EMAIL_USER) {
      console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const info = await activeTransporter.sendMail({
      from: `"PlaceTrack" <${process.env.EMAIL_USER}>`,
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
