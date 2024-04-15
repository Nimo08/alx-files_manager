import { Router } from 'express';
import AppController from '../controllers/AppController';

import FilesController from '../controllers/FilesController';

const { postNew, getMe } = require('../controllers/UsersController');
const { getConnect, getDisconnect } = require('../controllers/AuthController');

const router = Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', postNew);

router.get('/connect', getConnect);

router.get('/disconnect', getDisconnect);

router.get('/users/me', getMe);

router.post('/files', FilesController.postUpload);

router.get('/files/:id', FilesController.getShow);

router.get('/files', FilesController.getIndex);

router.put('/files/:id/publish', FilesController.putPublish);

router.put('/files/:id/unpublish', FilesController.putUnpublish);

router.get('/files/:id/data', FilesController.getFile);

module.exports = router;
