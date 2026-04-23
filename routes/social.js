//! routes/social.js

import express from 'express';
import { validateFollowRequest } from '../middlewares/validators/social.js';
import { followRequest } from '../controllers/social/followRequest.js';
import { getNotifications } from '../controllers/social/notifications.js';

const router = express.Router();

router.get('/notifications', getNotifications);
router.post('/follow-request', validateFollowRequest, followRequest);

export default router;
