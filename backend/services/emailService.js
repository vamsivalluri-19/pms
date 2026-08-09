import nodemailer from 'nodemailer';

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });
} catch (error) {
  console.error('Nodemailer configuration error:', error);
}

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!transporter || !process.env.EMAIL_USER) {
      console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
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
