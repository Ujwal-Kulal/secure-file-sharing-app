const File = require('../models/File');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');

exports.uploadFile = async (req, res) => {
  try {
    const { originalname, filename, path: filePath } = req.file;
    const { password, expiresIn } = req.body;
    const userId = req.user.id;

    // 🔐 Encrypt the file using createCipheriv
    const fileBuffer = fs.readFileSync(filePath);
    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    // Store IV at the beginning of the file for later decryption
    const finalBuffer = Buffer.concat([iv, encryptedBuffer]);
    fs.writeFileSync(filePath, finalBuffer);

    // ⏳ Set expiry date if provided
    let expiryDate = null;
    if (expiresIn) {
      expiryDate = new Date(Date.now() + parseInt(expiresIn) * 1000);
    }

    // 💾 Save file metadata in DB (store IV for decryption)
    const file = await File.create({
      filename,
      originalName: originalname,
      path: filePath,
      size: req.file.size,
      password: password || null,
      expiresAt: expiryDate,
      uploadedBy: userId,
      iv: iv.toString('hex'), // Store IV as hex string
    });

    // 🪵 Log the upload event
    await Log.create({
      fileId: file._id,
      action: 'upload',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: userId,
    });

    res.status(201).json({ message: 'File uploaded successfully', fileId: file._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File upload failed', error: err.message });
  }
};