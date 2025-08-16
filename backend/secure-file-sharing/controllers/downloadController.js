const File = require('../models/File');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');

// Direct download (from dashboard) - bypasses expiry check
exports.directDownloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const password = req.body?.password; // Use optional chaining to handle undefined req.body

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // For POST requests, check password if file has one
    if (req.method === 'POST' && file.password) {
      if (!password || password !== file.password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // ✅ Use correct path
    const filePath = path.resolve(file.path);
    const encryptedBuffer = fs.readFileSync(filePath);
    // Extract IV and encrypted data
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);
    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);

    // ✅ Log the download
    await Log.create({
      fileId: file._id,
      action: 'download',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || null,
    });

    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decryptedBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File download failed', error: err.message });
  }
};

// Link-based download - checks expiry
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check expiration
    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(410).json({ message: 'Link has expired' });
    }

    // Check password if set
    if (file.password) {
      if (!password || password !== file.password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // ✅ Use correct path
    const filePath = path.resolve(file.path);
    const encryptedBuffer = fs.readFileSync(filePath);
    // Extract IV and encrypted data
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);
    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);

    // ✅ Log the download
    await Log.create({
      fileId: file._id,
      action: 'download',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || null,
    });

    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decryptedBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File download failed', error: err.message });
  }
};
