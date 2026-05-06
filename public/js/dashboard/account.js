//! public/js/dashboard/account.js

const usernameEditor = document.querySelector('[data-dashboard-username]');

if (usernameEditor) {
	const display = usernameEditor.querySelector('[data-username-display]');
	const form = usernameEditor.querySelector('[data-username-form]');
	const input = form?.querySelector('input[name="username"]');
	const editButton = usernameEditor.querySelector('[data-username-edit]');
	const cancelButton = usernameEditor.querySelector('[data-username-cancel]');
	const originalUsername = input?.value || '';

	function setEditing(isEditing) {
		display?.classList.toggle('d-none', isEditing);
		form?.classList.toggle('d-none', !isEditing);

		if (isEditing) {
			input?.focus();
			input?.select();
		}
	}

	editButton?.addEventListener('click', () => setEditing(true));

	cancelButton?.addEventListener('click', () => {
		if (input) {
			input.value = originalUsername;
		}

		setEditing(false);
	});
}

const countryEditor = document.querySelector('[data-dashboard-country]');

if (countryEditor) {
	const display = countryEditor.querySelector('[data-country-display]');
	const target = countryEditor.querySelector('[data-country-editor]');
	const editButton = countryEditor.querySelector('[data-country-edit]');

	function initCountryDropdown(scope) {
		const dropdown = scope.querySelector('.complete-signup-country');
		const input = scope.querySelector('#dashboardCountryCode');
		const selected = dropdown?.querySelector(
			'.complete-signup-country__selected',
		);
		const options = dropdown?.querySelectorAll(
			'.complete-signup-country__option',
		);

		options?.forEach((option) => {
			option.addEventListener('click', () => {
				if (!input || !selected) return;

				const countryCode = option.dataset.countryCode || '';
				const countryName = option.dataset.countryName || '';
				const flag = option.querySelector('.fi')?.cloneNode(true);

				input.value = countryCode;
				selected.textContent = '';

				if (flag) {
					flag.classList.add('complete-signup-country__flag');
					selected.append(flag, document.createTextNode(countryName));
					return;
				}

				selected.textContent = countryName;
			});
		});
	}

	function initDynamicTooltips(scope) {
		if (!window.bootstrap?.Tooltip) return;

		scope.querySelectorAll('.has-tooltip').forEach((element) => {
			bootstrap.Tooltip.getOrCreateInstance(element, {
				trigger: 'hover',
				delay: { show: 1000, hide: 0 },
			});
		});
	}

	async function loadEditor() {
		if (!target || target.dataset.loaded === 'true') {
			return;
		}

		const url = editButton?.dataset.countryEditorUrl;

		if (!url) return;

		editButton.disabled = true;

		try {
			const response = await fetch(url, {
				headers: { Accept: 'text/html' },
			});

			if (!response.ok) return;

			target.innerHTML = await response.text();
			target.dataset.loaded = 'true';
			initCountryDropdown(target);
			initDynamicTooltips(target);

			const cancelButton = target.querySelector('[data-country-cancel]');
			cancelButton?.addEventListener('click', () => {
				display?.classList.remove('d-none');
				target.classList.add('d-none');
			});
		} finally {
			editButton.disabled = false;
		}
	}

	editButton?.addEventListener('click', async () => {
		await loadEditor();
		display?.classList.add('d-none');
		target?.classList.remove('d-none');
	});
}
