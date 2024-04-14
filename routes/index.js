import { Router } from 'express';
import AppController from '../controllers/AppController';

const { postNew } = require('../controllers/UsersController');

const router = Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', postNew);

module.exports = router;
