import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }
  if (!dbClient.isAlive()) {
    throw new Error('Database connection is not established.');
  }
  const userExist = await dbClient.dbClient.collection('users').findOne({ email });
  if (userExist) {
    return res.status(400).json({ error: 'Already exist' });
  }
  const hashedPasswd = sha1(password);
  const user = {
    email,
    password: hashedPasswd,
  };
  const result = await dbClient.dbClient.collection('users').insertOne(user);
  const { _id, email: _email } = result.ops[0];
  return res.status(201).json({ id: _id, email: _email });
}

async function getMe(request, response) {
  const token = request.header('X-Token');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  const users = await dbClient.dbClient.collection('users').findOne({ _id: ObjectId(userId) });
  if (users) {
    return response.status(200).json({ email: users.email, id: users._id });
  }
  return response.status(401).json({ error: 'Unauthorized' });
}

module.exports = { postNew, getMe };
