import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    try {
      const users = dbClient.db.collection('users');
      const existingUser = await users.findOne({ email });

      if (existingUser) {
        return response.status(400).json({ error: 'Already exist' });
      }

      const hashedPasswd = sha1(password);
      const result = await users.insertOne({
        email,
        password: hashedPasswd,
      });

      // Add user to queue after successful insertion
      await userQueue.add({ userId: result.insertedId });

      return response.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
