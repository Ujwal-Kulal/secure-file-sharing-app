const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const File = require('../models/File');
const Log = require('../models/Log');
const Group = require('../models/Group');

const publicFilesFilter = {
  $or: [
    { groupId: '' },
    { groupId: null },
    { groupId: { $exists: false } },
  ],
};

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
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
    const { groupId } = req.query;
    if (groupId) {
      const group = await Group.findOne({ uniqueId: groupId.trim().toUpperCase() });
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const memberId = req.user.id.toString();
      const isMember = group.members.some((member) => member.toString() === memberId);
      if (!isMember) {
        return res.status(403).json({ error: 'Join the group first to view files' });
      }

      const groupFiles = await File.find({ groupId: group.uniqueId, uploadedBy: req.user.id }).sort({ createdAt: -1 });
      const fileIds = groupFiles.map((file) => file._id);
      const downloadCountsRaw = await Log.aggregate([
        { $match: { fileId: { $in: fileIds }, action: 'download' } },
        { $group: { _id: '$fileId', count: { $sum: 1 } } }
      ]);
      const downloadCountMap = downloadCountsRaw.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});

      const allGroupFiles = groupFiles.map((file) => ({
        ...file.toObject(),
        isOwner: true,
        downloadCount: downloadCountMap[file._id.toString()] || 0,
      }));

      return res.json(allGroupFiles);
    }

    // Public dashboard should include only public uploads (no groupId)
    const ownedFiles = await File.find({
      uploadedBy: req.user.id,
      ...publicFilesFilter,
    }).sort({ createdAt: -1 });
    const fileIds = ownedFiles.map((file) => file._id);
    const downloadCountsRaw = await Log.aggregate([
      { $match: { fileId: { $in: fileIds }, action: 'download' } },
      { $group: { _id: '$fileId', count: { $sum: 1 } } }
    ]);
    const downloadCountMap = downloadCountsRaw.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});
    
    // Add ownership flag
    const allFiles = ownedFiles.map((file) => ({
      ...file.toObject(),
      isOwner: true,
      downloadCount: downloadCountMap[file._id.toString()] || 0
    }));
    
    res.json(allFiles);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get shared files accessible to the user (must come before /:id route)
router.get('/shared', protect, async (req, res) => {
  try {
    const { groupId } = req.query;
    if (groupId) {
      const group = await Group.findOne({ uniqueId: groupId.trim().toUpperCase() });
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const memberId = req.user.id.toString();
      const isMember = group.members.some((member) => member.toString() === memberId);
      if (!isMember) {
        return res.status(403).json({ error: 'Join the group first to view files' });
      }

      const sharedFiles = await File.find({
        groupId: group.uniqueId,
        uploadedBy: { $ne: req.user._id },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }).sort({ createdAt: -1 });

      const sharedIds = sharedFiles.map((file) => file._id);
      const sharedCountsRaw = await Log.aggregate([
        { $match: { fileId: { $in: sharedIds }, action: 'download' } },
        { $group: { _id: '$fileId', count: { $sum: 1 } } }
      ]);
      const sharedCountMap = sharedCountsRaw.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});

      const allSharedFiles = sharedFiles.map((file) => ({
        ...file.toObject(),
        isOwner: false,
        downloadCount: sharedCountMap[file._id.toString()] || 0
      }));

      return res.json(allSharedFiles);
    }

    // Show files uploaded by other users that are still valid.
    // Include password-protected files as well; password is enforced during download.
    const sharedFiles = await File.find({
      uploadedBy: { $ne: req.user._id },
      $and: [
        publicFilesFilter,
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });
    const sharedIds = sharedFiles.map((file) => file._id);
    const sharedCountsRaw = await Log.aggregate([
      { $match: { fileId: { $in: sharedIds }, action: 'download' } },
      { $group: { _id: '$fileId', count: { $sum: 1 } } }
    ]);
    const sharedCountMap = sharedCountsRaw.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});
    
    // Add ownership flag
    const allSharedFiles = sharedFiles.map((file) => ({
      ...file.toObject(),
      isOwner: false,
      downloadCount: sharedCountMap[file._id.toString()] || 0
    }));
    
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

    // Group owners can delete any group file; otherwise only uploader can delete.
    let canDelete = file.uploadedBy.toString() === req.user.id;

    if (!canDelete && file.groupId) {
      const group = await Group.findOne({ uniqueId: file.groupId.trim().toUpperCase() });
      if (group) {
        const ownerIds = Array.isArray(group.owners) && group.owners.length > 0
          ? group.owners.map((owner) => owner.toString())
          : [group.createdBy.toString()];
        canDelete = ownerIds.includes(req.user.id);
      }
    }

    if (!canDelete) {
      return res.status(403).json({ message: 'Permission denied. You do not have access to delete this file.' });
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
