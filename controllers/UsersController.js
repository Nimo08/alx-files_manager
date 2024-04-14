import sha1 from 'sha1';
import dbClient from '../utils/db';

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

module.exports = { postNew };
