//! public/js/weather/main.js

const currentLocationButton = document.querySelector(
	'[data-weather-current-location]',
);

if (currentLocationButton) {
	const form = currentLocationButton.closest('form');
	const latitudeInput = form?.querySelector('[data-weather-latitude]');
	const longitudeInput = form?.querySelector('[data-weather-longitude]');

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
