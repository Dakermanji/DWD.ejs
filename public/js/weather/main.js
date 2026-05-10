//! public/js/weather/main.js

const CITY_SEARCH_MIN_LENGTH = 3;
const CITY_SEARCH_DEBOUNCE_MS = 300;

const currentLocationButton = document.querySelector(
	'[data-weather-current-location]',
);
const cityInput = document.querySelector('[data-weather-city-input]');
const cityResults = document.querySelector('[data-weather-city-results]');

let citySearchTimer = null;
let citySearchController = null;
let activeCityIndex = -1;
let renderedCities = [];

function getWeatherForm() {
	return cityInput?.closest('form') || currentLocationButton?.closest('form');
}

function getLocationInputs(form) {
	return {
		latitude: form?.querySelector('[data-weather-latitude]'),
		longitude: form?.querySelector('[data-weather-longitude]'),
	};
}

function hideCityResults() {
	if (!cityResults || !cityInput) return;

	cityResults.hidden = true;
	cityResults.replaceChildren();
	cityInput.setAttribute('aria-expanded', 'false');
	activeCityIndex = -1;
	renderedCities = [];
}

function clearSelectedLocation() {
	const inputs = getLocationInputs(getWeatherForm());

	Object.values(inputs).forEach((input) => {
		if (input) input.value = '';
	});
}

function setActiveCity(index) {
	if (!cityResults) return;

	const options = [...cityResults.querySelectorAll('.weather-city-option')];
	activeCityIndex = index;

	options.forEach((option, optionIndex) => {
		option.classList.toggle('is-active', optionIndex === activeCityIndex);
	});

	options[activeCityIndex]?.scrollIntoView({ block: 'nearest' });
}

function selectCity(city) {
	const form = getWeatherForm();
	const inputs = getLocationInputs(form);

	if (!form || !cityInput || !city) return;

	cityInput.value = city.city || '';

	if (inputs.latitude) inputs.latitude.value = city.latitude || '';
	if (inputs.longitude) inputs.longitude.value = city.longitude || '';

	hideCityResults();
	form.requestSubmit();
}

function createCityOption(city, index) {
	const option = document.createElement('button');
	const flag = document.createElement('span');
	const label = document.createElement('span');

	option.type = 'button';
	option.className = 'weather-city-option';
	option.setAttribute('role', 'option');
	option.addEventListener('click', () => selectCity(city));

	flag.className = `fi fi-${String(city.countryCode || '').toLocaleLowerCase()} weather-city-option__flag`;
	flag.setAttribute('aria-hidden', 'true');

	label.className = 'weather-city-option__label';
	label.textContent = city.label || city.city || '';

	option.append(flag, label);

	if (index === activeCityIndex) {
		option.classList.add('is-active');
	}

	return option;
}

function renderCityResults(cities) {
	if (!cityResults || !cityInput) return;

	renderedCities = Array.isArray(cities) ? cities : [];
	activeCityIndex = -1;

	if (!renderedCities.length) {
		hideCityResults();
		return;
	}

	cityResults.replaceChildren(...renderedCities.map(createCityOption));
	cityResults.hidden = false;
	cityInput.setAttribute('aria-expanded', 'true');
}

async function searchCities(query) {
	if (citySearchController) {
		citySearchController.abort();
	}

	citySearchController = new AbortController();

	const params = new URLSearchParams({ query });
	const response = await fetch(`/weather/cities?${params.toString()}`, {
		headers: { Accept: 'application/json' },
		signal: citySearchController.signal,
	});

	if (!response.ok) {
		hideCityResults();
		return;
	}

	const data = await response.json();
	renderCityResults(data?.cities);
}

if (cityInput) {
	cityInput.addEventListener('input', () => {
		const query = cityInput.value.trim();

		clearSelectedLocation();
		window.clearTimeout(citySearchTimer);

		if (query.length < CITY_SEARCH_MIN_LENGTH) {
			hideCityResults();
			return;
		}

		citySearchTimer = window.setTimeout(() => {
			searchCities(query).catch((error) => {
				if (error.name !== 'AbortError') hideCityResults();
			});
		}, CITY_SEARCH_DEBOUNCE_MS);
	});

	cityInput.addEventListener('keydown', (event) => {
		if (!renderedCities.length) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setActiveCity(Math.min(activeCityIndex + 1, renderedCities.length - 1));
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setActiveCity(Math.max(activeCityIndex - 1, 0));
		}

		if (event.key === 'Enter' && activeCityIndex >= 0) {
			event.preventDefault();
			selectCity(renderedCities[activeCityIndex]);
		}

		if (event.key === 'Escape') {
			hideCityResults();
		}
	});

	document.addEventListener('click', (event) => {
		if (!event.target.closest('.weather-search')) {
			hideCityResults();
		}
	});
}

if (currentLocationButton) {
	const form = getWeatherForm();
	const { latitude: latitudeInput, longitude: longitudeInput } =
		getLocationInputs(form);

	currentLocationButton.addEventListener('click', () => {
		if (!navigator.geolocation || !form || !latitudeInput || !longitudeInput) {
			return;
		}

		currentLocationButton.disabled = true;
		currentLocationButton.setAttribute('aria-busy', 'true');

		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitudeInput.value = position.coords.latitude;
				longitudeInput.value = position.coords.longitude;
				form.requestSubmit();
			},
			() => {
				currentLocationButton.disabled = false;
				currentLocationButton.removeAttribute('aria-busy');
			},
			{
				enableHighAccuracy: false,
				maximumAge: 300000,
				timeout: 10000,
			},
		);
	});
}
