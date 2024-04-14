import { Router } from 'express';
import AppController from '../controllers/AppController';

const { postNew } = require('../controllers/UsersController');
const { getConnect } = require('../controllers/AuthController');
const { getDisconnect } = require('../controllers/AuthController');
const { getMe } = require('../controllers/UsersController');

const router = Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', postNew);

router.get('/connect', getConnect);

router.get('/disconnect', getDisconnect);

router.get('/users/me', getMe);

module.exports = router;
