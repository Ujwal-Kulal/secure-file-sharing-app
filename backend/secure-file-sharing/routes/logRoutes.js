const express = require('express');
const router = express.Router();

const Log = require('../models/Log');
const File = require('../models/File');
const User = require('../models/User');

const { protect } = require('../middleware/authMiddleware');

// GET logs for a specific file - protected route
router.get('/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    const currentUserId = req.user.id;

    // Get all logs related to this file
    const logs = await Log.find({ fileId }).sort({ timestamp: -1 });

    // Get file details
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if current user is the file owner
    const isFileOwner = file.uploadedBy.toString() === currentUserId;

    // Get file owner information (only for file owners)
    let fileOwner = null;
    if (isFileOwner) {
      fileOwner = await User.findById(file.uploadedBy).select('username email');
    }

    // Prepare detailed log response with privacy controls
    const response = await Promise.all(
      logs.map(async (log) => {
        let user = null;
        let userDisplay = 'Anonymous';
        let userDetails = null;

        if (log.userId) {
          user = await User.findById(log.userId).select('username email');
          
          if (user) {
            // If current user is file owner, show full details
            if (isFileOwner) {
              userDisplay = user.username || user.email;
              userDetails = {
                username: user.username,
                email: user.email
              };
            } else {
              // If current user is not file owner
              if (log.userId.toString() === currentUserId) {
                // Show their own details
                userDisplay = user.username || user.email;
                userDetails = {
                  username: user.username,
                  email: user.email
                };
              } else {
                // Show "Anonymous" for other users (including file owner)
                userDisplay = 'Anonymous';
                userDetails = null;
              }
            }
          }
        }

        return {
          action: log.action,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          user: userDisplay,
          userDetails: userDetails,
          fileName: file.originalName,
          fileSize: file.size,
          isFileOwner: isFileOwner,
          fileOwnerInfo: fileOwner ? {
            username: fileOwner.username,
            email: fileOwner.email
          } : null
        };
      })
    );

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
});

module.exports = router;
