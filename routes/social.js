//! routes/social.js

import express from 'express';
import { validateFollowRequest } from '../middlewares/validators/social.js';
import { followRequest } from '../controllers/social/followRequest.js';
import { getBlocked } from '../controllers/social/blocked.js';
import { getFollowees } from '../controllers/social/followees.js';
import { getFollowers } from '../controllers/social/followers.js';
import { getNotifications } from '../controllers/social/notifications.js';
import { postSocialAction } from '../controllers/social/actions.js';

const router = express.Router();

router.get('/notifications', getNotifications);
router.get('/blocked', getBlocked);
router.get('/followees', getFollowees);
router.get('/followers', getFollowers);
router.post('/actions', postSocialAction);
router.post('/follow-request', validateFollowRequest, followRequest);

export default router;
