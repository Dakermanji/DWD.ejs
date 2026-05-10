//! routes/weather.js

import { Router } from 'express';
import { renderWeather } from '../controllers/weather.js';

const router = Router();

router.get('/', renderWeather);

export default router;
