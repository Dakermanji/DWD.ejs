//! routes/weather.js

import { Router } from 'express';
import { renderWeather } from '../controllers/weather/main.js';
import { searchCities } from '../controllers/weather/searchCities.js';
import { validateWeatherQuery } from '../middlewares/validators/weather.js';

const router = Router();

router.get('/', validateWeatherQuery, renderWeather);
router.get('/cities', searchCities);

export default router;
