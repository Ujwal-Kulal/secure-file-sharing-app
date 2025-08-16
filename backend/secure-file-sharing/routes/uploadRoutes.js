const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const File = require('../models/File');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), uploadFile);

// Get files owned by the current user
router.get('/', protect, async (req, res) => {
  try {
    // Show files owned by the current user
    const ownedFiles = await File.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    
    // Add ownership flag
    const allFiles = ownedFiles.map(file => ({ ...file.toObject(), isOwner: true }));
    
    res.json(allFiles);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get shared files accessible to the user (must come before /:id route)
router.get('/shared', protect, async (req, res) => {
  try {
    // Show files that are accessible to the user (not owned by them)
    // For now, show all files that don't have passwords or haven't expired
    const sharedFiles = await File.find({
      uploadedBy: { $ne: req.user.id },
      $or: [
        { password: { $exists: false } },
        { password: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });
    
    // Add ownership flag
    const allSharedFiles = sharedFiles.map(file => ({ ...file.toObject(), isOwner: false }));
    
    res.json(allSharedFiles);
  } catch (err) {
    console.error('Error fetching shared files:', err);
    res.status(500).json({ error: 'Failed to fetch shared files' });
  }
});

// Get file info by ID for download page
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching file info', error: err.message });
  }
});

// Delete file by ID - only file owner can delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if current user is the file owner
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied. Only file owner can delete this file.' });
    }

    // Delete the file from storage
    const fs = require('fs');
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
});

module.exports = router;
