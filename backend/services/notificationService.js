import { Notification } from '../models/System.js';
import { User } from '../models/User.js';
import { sendRealTimeNotification } from './socketService.js';
import { sendEmail } from './emailService.js';

/**
 * Creates a system notification, sends it in real-time via WebSockets, and auto-emails the recipient.
 */
export const createAndSendNotification = async ({ recipientId, senderId, type, title, message, link }) => {
  try {
    // 1. Create notification in database
    const notif = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      link
    });

    // 2. Dispatch real-time WebSocket alert
    sendRealTimeNotification(recipientId, notif);

    // 3. Dispatch auto-email
    const user = await User.findById(recipientId);
    if (user && user.email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3050';
      const notificationLink = link ? `${frontendUrl}${link}` : frontendUrl;

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PlaceTrack Notification</h1>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 30px; background-color: #ffffff; color: #1e293b;">
            <h2 style="margin-top: 0; font-size: 18px; font-weight: 700; color: #0f172a;">${title}</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 25px;">${message}</p>
            
            ${link ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${notificationLink}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); transition: background-color 0.2s;">
                  View Updates
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated institutional update. Please do not reply directly.</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #cbd5e1;">&copy; 2026 PlaceTrack System Operations. All rights reserved.</p>
          </div>
        </div>
      `;

      sendEmail({
        to: user.email,
        subject: `PlaceTrack - ${title}`,
        html: emailHtml
      }).catch(err => console.error(`Error sending notification email to ${user.email}:`, err));
    }

    return notif;
  } catch (error) {
    console.error(`Failed to dispatch notification to user ${recipientId}:`, error);
  }
};
