import { AuditLog } from '../models/System.js';

export const logAuditEvent = async (req, { action, entity, entityId, oldValue, newValue }) => {
  try {
    const user = req.user ? req.user._id : null;
    const userEmail = req.user ? req.user.email : 'System/Guest';
    const role = req.user ? req.user.role : 'System/Guest';
    const ipAddress = req.ip || req.connection.remoteAddress;

    await AuditLog.create({
      user,
      userEmail,
      role,
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      ipAddress
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};
