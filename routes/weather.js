//! routes/weather.js

import { Router } from 'express';
import { renderWeather, searchCities } from '../controllers/weather.js';
import { validateWeatherQuery } from '../middlewares/validators/weather.js';

const router = Router();

router.get('/', validateWeatherQuery, renderWeather);
router.get('/cities', searchCities);

export default router;
