const express = require('express');
const router = express.Router();
const { downloadFile, directDownloadFile } = require('../controllers/downloadController');
const { protect } = require('../middleware/authMiddleware');

// Direct download (from dashboard) - bypasses expiry check, requires authentication
router.get('/direct-download/:id', protect, directDownloadFile);
router.post('/direct-download/:id', protect, directDownloadFile);

// Link-based download - checks expiry, no authentication required
router.post('/download/:id', downloadFile); // Send file ID and optional password in body

module.exports = router;
