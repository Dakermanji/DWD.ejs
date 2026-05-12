//! services/apiUsage/limits.js

const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;

export const API_USAGE_LIMITS = {
	weather: {
		forecast: [
			{ key: 'minute', max: 20, durationMs: minute },
			{ key: 'hour', max: 300, durationMs: hour },
			{ key: 'day', max: 1000, durationMs: day },
			{ key: 'week', max: 4000, durationMs: week },
			{ key: 'month', max: 12000, durationMs: month },
		],
	},
	geolocation: {
		city_search: [
			{ key: 'minute', max: 20, durationMs: minute },
			{ key: 'hour', max: 300, durationMs: hour },
			{ key: 'day', max: 1000, durationMs: day },
			{ key: 'week', max: 4000, durationMs: week },
			{ key: 'month', max: 12000, durationMs: month },
		],
	},
};
