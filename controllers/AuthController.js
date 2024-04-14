import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    try {
      const authData = request.header('Authorization');
      if (!authData || !authData.startsWith('Basic ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const encodedCredentials = authData.split(' ')[1];
      const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
      const [email, password] = decodedCredentials.split(':');

      if (!email || !password) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const hashedPassword = sha1(password);
      const users = dbClient.db.collection('users');
      const user = await users.findOne({ email, password: hashedPassword });

      if (!user) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 'EX', 60 * 60 * 24); // Set expiry for 24 hours
      response.status(200).json({ token });
    } catch (error) {
      console.error('Error connecting user:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(request, response) {
    try {
      const token = request.header('X-Token');
      if (!token) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const key = `auth_${token}`;
      const id = await redisClient.get(key);

      if (!id) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await redisClient.del(key);
      response.status(204).json({});
    } catch (error) {
      console.error('Error disconnecting user:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getUserByToken(token) {
    try {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return null;
      }

      const users = dbClient.db.collection('users');
      const user = await users.findOne({ _id: userId });
      return user;
    } catch (error) {
      console.error('Error retrieving user by token:', error);
      return null;
    }
  }
}

export default AuthController;
