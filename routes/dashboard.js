//! routes/dashboard.js

import { Router } from 'express';
import { renderDashboard } from '../controllers/dashboard.js';

const router = Router();

router.get('/', renderDashboard);

export default router;
