import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function getConnect(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const encodedData = authHeader.split(' ')[1];
  const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8');
  const [email, password] = decodedData.split(':');

  const user = await dbClient.dbClient.collection('users').findOne({ email, password: sha1(password) });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();

  const key = `auth_${token}`;
  redisClient.set(key, user._id.toString(), 86400);

  return res.status(200).json({ token });
}

async function getDisconnect(request, response) {
  const token = request.header('X-Token');
  const key = `auth_${token}`;
  const id = await redisClient.get(key);
  if (id) {
    await redisClient.del(key);
    return response.status(204).json({});
  }
  return response.status(401).json({ error: 'Unauthorized' });
}

module.exports = { getConnect, getDisconnect };
