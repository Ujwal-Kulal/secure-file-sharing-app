const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
	createGroup,
	joinGroup,
	getMyGroups,
	getGroupByUniqueId,
	getGroupFiles,
	promoteOwner,
	removeMember,
	deleteGroup,
} = require('../controllers/groupController');

router.post('/create', protect, createGroup);
router.post('/join', protect, joinGroup);
router.get('/mine', protect, getMyGroups);
router.patch('/:uniqueId/owners/:memberId', protect, promoteOwner);
router.delete('/:uniqueId/members/:memberId', protect, removeMember);
router.delete('/:uniqueId', protect, deleteGroup);
router.get('/:uniqueId', protect, getGroupByUniqueId);
router.get('/:uniqueId/files', protect, getGroupFiles);

module.exports = router;