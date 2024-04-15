import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postUpload(request, response) {
  const token = request.header('X-Token');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  const {
    name, type, parentId = 0, isPublic = false, data,
  } = request.body;
  if (!name) {
    return response.status(400).json({ error: 'Missing name' });
  }
  if (!type) {
    return response.status(400).json({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    return response.status(400).json({ error: 'Missing data' });
  }
  const file = {
    name,
    type,
    userId,
    parentId,
    isPublic,
  };
  const files = dbClient.dbClient.collection('files');
  if (parentId) {
    const idObject = ObjectID(parentId);
    const parentFolder = await files.findOne({ _id: idObject });
    if (!parentFolder) {
      return response.status(400).json({ error: 'Parent not found' });
    } if (parentFolder.type !== 'folder') {
      return response.status(400).json({ error: 'Parent is not a folder' });
    }
  }
  if (type === 'folder') {
    const result = await files.insertOne(file);
    const [{
      name, _id, isPublic, userId, type, parentId,
    }] = result.ops;
    return response.status(201).json({
      id: _id.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  await fs.promises.mkdir(folderPath, { recursive: true });
  const filePath = `${folderPath}/${uuidv4()}`;
  await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));
  file.localPath = filePath;
  if (type !== 'folder') {
    const result = await files.insertOne(file);
    const [{
      name, _id, isPublic, userId, type, parentId,
    }] = result.ops;
    return response.status(201).json({
      id: _id.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }
  return response.status(400).json({ error: 'Invalid request' });
}

module.exports = { postUpload };
