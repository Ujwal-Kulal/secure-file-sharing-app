const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Group = require('../models/Group');
const File = require('../models/File');
const Log = require('../models/Log');

const generateUniqueId = async () => {
  let uniqueId = '';
  let exists = true;

  while (exists) {
    uniqueId = crypto.randomBytes(4).toString('hex').toUpperCase();
    exists = await Group.exists({ uniqueId });
  }

  return uniqueId;
};

const isValidUniqueId = (value) => /^[A-Z0-9]{6,12}$/.test(value);

const hasId = (value, expectedId) => {
  if (!value) return false;
  if (typeof value === 'string') return value === expectedId;
  if (value._id) return String(value._id) === expectedId;
  return String(value) === expectedId;
};

const getOwnerIds = (group) => {
  if (Array.isArray(group.owners) && group.owners.length > 0) {
    return group.owners.map((owner) => (owner?._id ? String(owner._id) : String(owner)));
  }
  return [String(group.createdBy?._id || group.createdBy)];
};

const isGroupOwner = (group, userId) => getOwnerIds(group).includes(String(userId));

exports.getMyGroups = async (req, res) => {
  try {
    const memberId = req.user.id;
    const groups = await Group.find({ members: memberId })
      .populate('createdBy', 'username email')
      .populate('owners', 'username email')
      .sort({ updatedAt: -1 });

    res.json({
      groups: groups.map((group) => ({
        id: group._id,
        name: group.name,
        uniqueId: group.uniqueId,
        memberLimit: group.memberLimit,
        memberCount: group.members.length,
        createdBy: group.createdBy,
        isOwner: isGroupOwner(group, memberId),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load your groups', error: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, memberLimit, uniqueId: providedUniqueId } = req.body;

    if (!name || !memberLimit) {
      return res.status(400).json({ message: 'Group name and member limit are required' });
    }

    const limitValue = Number(memberLimit);
    if (Number.isNaN(limitValue) || limitValue < 2) {
      return res.status(400).json({ message: 'Member limit must be at least 2' });
    }

    let uniqueId = '';

    if (providedUniqueId) {
      uniqueId = String(providedUniqueId).trim().toUpperCase();
      if (!isValidUniqueId(uniqueId)) {
        return res.status(400).json({ message: 'Unique id must be 6-12 characters using letters and numbers only' });
      }
      const existingGroup = await Group.findOne({ uniqueId });
      if (existingGroup) {
        return res.status(400).json({ message: 'Unique id already exists' });
      }
    } else {
      uniqueId = await generateUniqueId();
    }

    const group = await Group.create({
      name: name.trim(),
      uniqueId,
      memberLimit: limitValue,
      createdBy: req.user.id,
      owners: [req.user.id],
      members: [req.user.id],
    });

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { uniqueId } = req.body;

    if (!uniqueId) {
      return res.status(400).json({ message: 'Unique group id is required' });
    }

    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberId = req.user.id.toString();
    const alreadyMember = group.members.some((member) => member.toString() === memberId);
    if (!alreadyMember && group.members.length >= group.memberLimit) {
      return res.status(400).json({ message: 'Group member limit reached' });
    }

    if (!alreadyMember) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.json({
      message: 'Joined group successfully',
      group,
      alreadyMember,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join group', error: err.message });
  }
};

exports.getGroupByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() })
      .populate('createdBy', 'username email')
      .populate('owners', 'username email')
      .populate('members', 'username email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberId = req.user.id.toString();
    const isMember = group.members.some((member) => String(member._id) === memberId);
    const isOwner = isGroupOwner(group, memberId);

    if (!isMember) {
      return res.status(403).json({ message: 'You must join this group first' });
    }

    res.json({
      group: {
        id: group._id,
        name: group.name,
        uniqueId: group.uniqueId,
        memberLimit: group.memberLimit,
        memberCount: group.members.length,
        createdBy: group.createdBy,
        owners: (group.owners && group.owners.length > 0 ? group.owners : [group.createdBy]).map((owner) => ({
          id: owner._id,
          username: owner.username,
          email: owner.email,
        })),
        isMember,
        isOwner,
        members: group.members.map((member) => ({
          id: member._id,
          username: member.username,
          email: member.email,
          isOwner: isGroupOwner(group, member._id),
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load group', error: err.message });
  }
};

exports.getGroupFiles = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberId = req.user.id.toString();
    const isMember = group.members.some((member) => member.toString() === memberId);
    if (!isMember) {
      return res.status(403).json({ message: 'You must join this group first' });
    }

    const files = await File.find({ groupId: group.uniqueId }).sort({ createdAt: -1 });
    res.json({
      group: {
        id: group._id,
        name: group.name,
        uniqueId: group.uniqueId,
        memberLimit: group.memberLimit,
        memberCount: group.members.length,
      },
      files,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load group files', error: err.message });
  }
};

exports.promoteOwner = async (req, res) => {
  try {
    const { uniqueId, memberId } = req.params;
    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const currentUserId = req.user.id.toString();
    if (!isGroupOwner(group, currentUserId)) {
      return res.status(403).json({ message: 'Only group owners can promote members' });
    }

    const isMember = group.members.some((member) => String(member) === String(memberId));
    if (!isMember) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }

    const ownerIds = getOwnerIds(group);
    if (!ownerIds.includes(String(memberId))) {
      group.owners = [...ownerIds, String(memberId)];
      await group.save();
    }

    res.json({ message: 'Member promoted to owner successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote member', error: err.message });
  }
};

exports.demoteOwner = async (req, res) => {
  try {
    const { uniqueId, memberId } = req.params;
    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const currentUserId = req.user.id.toString();
    if (!isGroupOwner(group, currentUserId)) {
      return res.status(403).json({ message: 'Only group owners can demote owners' });
    }

    const isMember = group.members.some((member) => String(member) === String(memberId));
    if (!isMember) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }

    const ownerIds = getOwnerIds(group);
    if (!ownerIds.includes(String(memberId))) {
      return res.status(400).json({ message: 'Selected user is not an owner' });
    }

    const nextOwners = ownerIds.filter((ownerId) => ownerId !== String(memberId));
    if (nextOwners.length === 0) {
      return res.status(400).json({ message: 'Group must have at least one owner' });
    }

    group.owners = nextOwners;
    await group.save();

    res.json({ message: 'Owner demoted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to demote owner', error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { uniqueId, memberId } = req.params;
    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const currentUserId = req.user.id.toString();
    if (!isGroupOwner(group, currentUserId)) {
      return res.status(403).json({ message: 'Only group owners can remove members' });
    }

    const memberExists = group.members.some((member) => String(member) === String(memberId));
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found in group' });
    }

    const nextMembers = group.members.filter((member) => String(member) !== String(memberId));
    if (nextMembers.length === 0) {
      return res.status(400).json({ message: 'Group must have at least one member' });
    }

    let nextOwners = getOwnerIds(group).filter((ownerId) => ownerId !== String(memberId));
    if (nextOwners.length === 0) {
      return res.status(400).json({ message: 'Group must have at least one owner' });
    }

    group.members = nextMembers;
    group.owners = nextOwners;
    await group.save();

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member', error: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const group = await Group.findOne({ uniqueId: uniqueId.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const currentUserId = req.user.id.toString();
    if (!isGroupOwner(group, currentUserId)) {
      return res.status(403).json({ message: 'Only group owners can delete the group' });
    }

    const groupFiles = await File.find({ groupId: group.uniqueId });
    const fileIds = groupFiles.map((file) => file._id);

    for (const file of groupFiles) {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (fileIds.length > 0) {
      await Log.deleteMany({ fileId: { $in: fileIds } });
    }

    await File.deleteMany({ groupId: group.uniqueId });
    await Group.deleteOne({ _id: group._id });

    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete group', error: err.message });
  }
};