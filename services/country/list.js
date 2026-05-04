//! services/country/list.js

import countries from 'flag-icons/country.json' with { type: 'json' };

export const COUNTRY_CODES = countries
	.filter((country) => country.iso && /^[a-z]{2}$/.test(country.code))
	.map((country) => country.code.toUpperCase())
	.sort();

export const COUNTRY_CODE_SET = new Set(COUNTRY_CODES);

export function isSupportedCountryCode(countryCode) {
	return COUNTRY_CODE_SET.has(countryCode);
}

export function getCountryOptions(locale = 'en') {
	const displayNames = new Intl.DisplayNames([locale], { type: 'region' });

	return COUNTRY_CODES.map((code) => ({
		code,
		name: displayNames.of(code) || code,
	})).sort((a, b) => a.name.localeCompare(b.name, locale));
}
