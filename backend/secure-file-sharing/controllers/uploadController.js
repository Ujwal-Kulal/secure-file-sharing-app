const File = require('../models/File');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');
const Group = require('../models/Group');
const { uploadBufferToGridFs } = require('../utils/fileStorage');

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const normalizeIp = (ip) => {
    if (!ip) return 'Unknown';
    const clean = ip.trim();
    if (clean === '::1') return '127.0.0.1';
    if (clean.startsWith('::ffff:')) return clean.replace('::ffff:', '');
    return clean;
  };
  if (forwarded) {
    return normalizeIp(forwarded.split(',')[0]);
  }
  return normalizeIp(req.ip || req.socket?.remoteAddress);
};

const sanitizeFileDisplayName = (value) => String(value || '')
  .replace(/[\\/]+/g, ' ')
  .replace(/[\r\n\t]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getDisplayName = (originalName, customFileName) => {
  const safeOriginal = sanitizeFileDisplayName(originalName);
  const safeCustom = sanitizeFileDisplayName(customFileName);
  if (!safeCustom) return safeOriginal;

  const originalExt = path.extname(safeOriginal);
  const customExt = path.extname(safeCustom);
  const withExt = customExt ? safeCustom : `${safeCustom}${originalExt}`;

  return withExt.slice(0, 180);
};

exports.uploadFile = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const { originalname, filename, mimetype } = req.file;
    const { password, expiresIn, groupId, customFileName } = req.body;
    const userId = req.user.id;
    const extension = path.extname(originalname || filename || '').replace('.', '').toLowerCase();
    const fileType = extension || (mimetype ? mimetype.split('/')[1] : '') || 'unknown';
    const displayName = getDisplayName(originalname || filename, customFileName);

    // 🔐 Encrypt the file using createCipheriv
    const fileBuffer = fs.readFileSync(filePath);
    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    // Store IV at the beginning of the file for later decryption
    const finalBuffer = Buffer.concat([iv, encryptedBuffer]);

    // ⏳ Set expiry date if provided
    let expiryDate = null;
    if (expiresIn) {
      expiryDate = new Date(Date.now() + parseInt(expiresIn) * 1000);
    }

    // Keep group uploads isolated by storing a normalized groupId,
    // and only allow upload when the user is a member of that group.
    let normalizedGroupId = '';
    if (groupId) {
      normalizedGroupId = String(groupId).trim().toUpperCase();
      const group = await Group.findOne({ uniqueId: normalizedGroupId });
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      const memberId = String(userId);
      const isMember = group.members.some((member) => String(member) === memberId);
      if (!isMember) {
        return res.status(403).json({ message: 'You must join the group before uploading files' });
      }
    }

    const gridFsId = await uploadBufferToGridFs(finalBuffer, {
      filename: filename || originalname,
      contentType: mimetype,
      metadata: {
        uploadedBy: String(userId),
        groupId: normalizedGroupId,
      },
    });

    // 💾 Save file metadata in DB (store IV for decryption)
    const file = await File.create({
      filename,
      originalName: displayName,
      path: '',
      gridFsId,
      size: req.file.size,
      type: fileType,
      groupId: normalizedGroupId,
      password: password || null,
      expiresAt: expiryDate,
      uploadedBy: userId,
      iv: iv.toString('hex'), // Store IV as hex string
    });

    // 🪵 Log the upload event
    await Log.create({
      fileId: file._id,
      action: 'upload',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      userId: userId,
    });

    res.status(201).json({ message: 'File uploaded successfully', fileId: file._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File upload failed', error: err.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore temp file cleanup failures.
      }
    }
  }
};