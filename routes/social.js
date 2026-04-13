//! routes/social.js

import express from 'express';
import { validateFollowRequest } from '../middlewares/validators/social.js';
import { followRequest } from '../controllers/social/followRequest.js';

const router = express.Router();

router.post('/follow-request', validateFollowRequest, followRequest);

export default router;
