//! routes/weather.js

import { Router } from 'express';
import { renderWeather, searchCities } from '../controllers/weather.js';

const router = Router();

router.get('/', renderWeather);
router.get('/cities', searchCities);

export default router;
