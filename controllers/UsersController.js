import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { userQueue } from '../worker';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.dbClient.collection('users').findOne({ email });
    if (existingUser) {
      return response.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    const result = await dbClient.dbClient.collection('users').insertOne({ email, password: hashedPassword });
    userQueue.add({ userId: result.insertedId });
    return response.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(request, response) {
    const token = request.header('X-Token');
    if (!token) return response.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return response.status(401).json({ error: 'Unauthorized' });

    const users = await dbClient.dbClient.collection('users');
    const ObjId = new ObjectId(userId);

    const user = await users.findOne({ _id: ObjId });
    if (user) return response.status(200).json({ id: userId, email: user.email });
    return response.status(401).json({ error: 'Unauthorized' });
  }
}

export default UsersController;
