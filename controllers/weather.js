//! controllers/weather.js

const forecastDays = [
	{
		id: 'today',
		label: 'Today',
		condition: 'sunny',
		icon: 'bi-sun-fill',
		temp: 24,
		feelsLike: 25,
		high: 26,
		low: 17,
		pressure: 1016,
		cloudiness: 8,
		visibility: 10,
		sunrise: '5:22 AM',
		sunset: '8:18 PM',
		windDirection: 'SW',
		windGust: 21,
		precipitation: null,
		description: 'clear sky',
		summary: 'Clear sky with a light afternoon breeze.',
		humidity: 42,
		wind: 12,
		backgroundImage: '',
		mascotImage: '/images/weather/maple-coder-weather-sunny.png',
	},
	{
		id: 'tomorrow',
		label: 'Tomorrow',
		condition: 'cloudy',
		icon: 'bi-cloud-sun-fill',
		temp: 21,
		feelsLike: 20,
		high: 23,
		low: 15,
		pressure: 1012,
		cloudiness: 64,
		visibility: 9,
		sunrise: '5:21 AM',
		sunset: '8:19 PM',
		windDirection: 'W',
		windGust: 25,
		precipitation: null,
		description: 'broken clouds',
		summary: 'Mostly cloudy, with brighter breaks near noon.',
		humidity: 55,
		wind: 16,
		backgroundImage: '',
		mascotImage: '/images/weather/maple-coder-weather-cloudy.png',
	},
	{
		id: 'day-3',
		label: 'Day 3',
		condition: 'rainy',
		icon: 'bi-cloud-rain-heavy-fill',
		temp: 18,
		feelsLike: 18,
		high: 20,
		low: 13,
		pressure: 1007,
		cloudiness: 88,
		visibility: 7,
		sunrise: '5:20 AM',
		sunset: '8:20 PM',
		windDirection: 'NE',
		windGust: 29,
		precipitation: {
			type: 'rain',
			volume: 5.4,
		},
		description: 'light rain',
		summary: 'Steady showers likely through the morning.',
		humidity: 76,
		wind: 18,
		backgroundImage: '',
		mascotImage: '/images/weather/maple-coder-weather-rainy.png',
	},
	{
		id: 'day-4',
		label: 'Day 4',
		condition: 'stormy',
		icon: 'bi-cloud-lightning-rain-fill',
		temp: 19,
		feelsLike: 20,
		high: 22,
		low: 14,
		pressure: 1003,
		cloudiness: 92,
		visibility: 6,
		sunrise: '5:19 AM',
		sunset: '8:21 PM',
		windDirection: 'S',
		windGust: 38,
		precipitation: {
			type: 'rain',
			volume: 8.1,
		},
		description: 'thunderstorm with rain',
		summary: 'Chance of evening thunderstorms.',
		humidity: 70,
		wind: 22,
		backgroundImage: '',
		mascotImage: '/images/weather/maple-coder-weather-stormy.png',
	},
	{
		id: 'day-5',
		label: 'Day 5',
		condition: 'snowy',
		icon: 'bi-cloud-snow-fill',
		temp: 2,
		feelsLike: -2,
		high: 4,
		low: -3,
		pressure: 1021,
		cloudiness: 79,
		visibility: 5,
		sunrise: '5:18 AM',
		sunset: '8:22 PM',
		windDirection: 'NW',
		windGust: 24,
		precipitation: {
			type: 'snow',
			volume: 2.7,
		},
		description: 'light snow',
		summary: 'Light snow tapering off late in the day.',
		humidity: 81,
		wind: 14,
		backgroundImage: '',
		mascotImage: '/images/weather/maple-coder-weather-snowy.png',
	},
];

const location = {
	city: 'Montreal',
	state: 'Quebec',
	country: 'Canada',
	countryCode: 'CA',
};

const cityResults = [
	{
		city: 'Montreal',
		state: 'Quebec',
		country: 'Canada',
		countryCode: 'CA',
		latitude: 45.5017,
		longitude: -73.5673,
	},
	{
		city: 'Moncton',
		state: 'New Brunswick',
		country: 'Canada',
		countryCode: 'CA',
		latitude: 46.0878,
		longitude: -64.7782,
	},
	{
		city: 'Monterey',
		state: 'California',
		country: 'United States',
		countryCode: 'US',
		latitude: 36.6002,
		longitude: -121.8947,
	},
	{
		city: 'Monroe',
		state: 'Louisiana',
		country: 'United States',
		countryCode: 'US',
		latitude: 32.5093,
		longitude: -92.1193,
	},
	{
		city: 'Montpellier',
		state: 'Occitanie',
		country: 'France',
		countryCode: 'FR',
		latitude: 43.6119,
		longitude: 3.8772,
	},
];

function normalizeSearch(value) {
	return String(value || '').trim().toLocaleLowerCase();
}

function formatCityResult(city) {
	return {
		...city,
		label: [city.city, city.state, city.country].filter(Boolean).join(', '),
	};
}

export function renderWeather(req, res) {
	res.render('weather/main', {
		titleKey: 'weather:title',
		styles: ['weather/main'],
		scripts: ['weather/main'],
		location,
		unit: req.weather?.unit || 'metric',
		forecastDays,
	});
}

export function searchCities(req, res) {
	const query = normalizeSearch(req.query?.query);

	if (query.length < 3) {
		return res.json({
			ok: true,
			cities: [],
		});
	}

	const cities = cityResults
		.filter((city) => formatCityResult(city).label.toLocaleLowerCase().includes(query))
		.slice(0, 6)
		.map(formatCityResult);

	return res.json({
		ok: true,
		cities,
	});
}
