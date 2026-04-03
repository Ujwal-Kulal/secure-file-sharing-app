const mongoose = require('mongoose');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const getGridFsBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error('Database connection is not ready');
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'secureUploads',
  });
};

const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  return new mongoose.Types.ObjectId(value);
};

const uploadBufferToGridFs = async (buffer, { filename, contentType, metadata = {} }) => {
  const bucket = getGridFsBucket();
  const uploadStream = bucket.openUploadStream(filename, { contentType, metadata });
  await pipeline(Readable.from(buffer), uploadStream);
  return uploadStream.id;
};

const readBufferFromGridFs = async (fileId) => {
  const bucket = getGridFsBucket();
  const downloadStream = bucket.openDownloadStream(toObjectId(fileId));

  return new Promise((resolve, reject) => {
    const chunks = [];
    downloadStream.on('data', (chunk) => chunks.push(chunk));
    downloadStream.on('error', reject);
    downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

const deleteFileFromGridFs = async (fileId) => {
  if (!fileId) return;

  const bucket = getGridFsBucket();
  try {
    await bucket.delete(toObjectId(fileId));
  } catch (error) {
    if (error?.code === 27 || error?.codeName === 'FileNotFound') return;
    throw error;
  }
};

module.exports = {
  deleteFileFromGridFs,
  readBufferFromGridFs,
  uploadBufferToGridFs,
};