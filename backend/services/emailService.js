import nodemailer from 'nodemailer';

let transporter;

const DEFAULT_HOST = 'smtp.gmail.com';
const DEFAULT_PORT = 587;
const DEFAULT_USER = 'vamsivalluri52@gmail.com';
const DEFAULT_PASS = 'bnzaxuyrkziukbhv';

const getTransporter = () => {
  if (transporter) return transporter;

  try {
    const host = process.env.EMAIL_HOST || DEFAULT_HOST;
    const port = parseInt(process.env.EMAIL_PORT) || DEFAULT_PORT;
    const user = process.env.EMAIL_USER || DEFAULT_USER;
    const pass = process.env.EMAIL_PASS || DEFAULT_PASS;

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
    const user = process.env.EMAIL_USER || DEFAULT_USER;

    if (!activeTransporter || !user) {
      console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
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
