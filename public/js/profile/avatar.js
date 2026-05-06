//! public/js/profile/avatar.js

const modalTrigger = document.querySelector('[data-avatar-modal-trigger]');

function initProfileAvatarPicker(scope = document) {
	const avatarPicker = scope.querySelector('.profile-avatar-picker');

	if (!avatarPicker || avatarPicker.dataset.initialized === 'true') {
		return;
	}

	avatarPicker.dataset.initialized = 'true';

	const input = scope.querySelector('#profileAvatarSeed');
	const preview = scope.querySelector('#profileAvatarPreview');
	const previewFrame = avatarPicker.querySelector(
		'.complete-signup-avatar__preview',
	);
	const backgroundInput = avatarPicker.querySelector(
		'[data-avatar-background]',
	);
	const refreshButton = avatarPicker.querySelector('[data-avatar-refresh]');
	const styleName = avatarPicker.querySelector('[data-avatar-style-name]');
	const styles = [...avatarPicker.querySelectorAll('[data-avatar-style]')];
	const grids = [...avatarPicker.querySelectorAll('[data-avatar-grid]')];
	let options = [...avatarPicker.querySelectorAll('[data-avatar-value]')];

	function normalizeBackground(value) {
		return /^#[a-f0-9]{6}$/i.test(value) ? value.toLowerCase() : '#f7c59f';
	}

	function withBackground(avatarValue, background) {
		const [style, seed] = avatarValue.split(':');
		const normalized = normalizeBackground(background).replace('#', '');

		return `${style}:${seed}:${normalized}`;
	}

	function setAvatarBackground(background) {
		const normalized = normalizeBackground(background);

		previewFrame?.style.setProperty('--avatar-bg', normalized);
		avatarPicker.style.setProperty('--avatar-bg', normalized);

		if (input?.value) {
			input.value = withBackground(input.value, normalized);
		}
	}

	function selectAvatar(option) {
		if (!input || !preview || !option) return;

		options.forEach((item) => item.classList.remove('is-active'));
		option.classList.add('is-active');

		input.value = withBackground(
			option.dataset.avatarValue || '',
			backgroundInput?.value || '#f7c59f',
		);
		preview.src = option.dataset.avatarSrc || '';
	}

	function createAvatarOption(avatar) {
		const button = document.createElement('button');
		const frame = document.createElement('span');
		const image = document.createElement('img');

		button.type = 'button';
		button.className = 'complete-signup-avatar__option';
		button.dataset.avatarValue = avatar.value || '';
		button.dataset.avatarSrc = avatar.src || '';
		button.addEventListener('click', () => selectAvatar(button));

		image.src = avatar.src || '';
		image.alt = '';

		frame.append(image);
		button.append(frame);

		return button;
	}

	function refreshOptionList() {
		options = [...avatarPicker.querySelectorAll('[data-avatar-value]')];
	}

	function selectStyle(styleButton) {
		const styleKey = styleButton.dataset.avatarStyle || '';

		styles.forEach((item) => item.classList.remove('is-active'));
		styleButton.classList.add('is-active');
		avatarPicker.dataset.activeStyle = styleKey;

		if (styleName) {
			styleName.textContent = styleButton.dataset.avatarStyleLabel || '';
		}

		grids.forEach((grid) => {
			grid.classList.toggle('d-none', grid.dataset.avatarGrid !== styleKey);
		});

		const firstOption = avatarPicker.querySelector(
			`[data-avatar-grid="${styleKey}"] [data-avatar-value]`,
		);

		selectAvatar(firstOption);
	}

	async function refreshActiveStyle() {
		const activeStyle = avatarPicker.dataset.activeStyle || '';
		const activeGrid = grids.find(
			(grid) => grid.dataset.avatarGrid === activeStyle,
		);
		const activeStyleButton = styles.find(
			(styleButton) => styleButton.dataset.avatarStyle === activeStyle,
		);

		if (!activeStyle || !activeGrid || !refreshButton) return;

		refreshButton.disabled = true;
		refreshButton.classList.add('is-loading');

		try {
			const response = await fetch(
				`/avatar/options/${encodeURIComponent(activeStyle)}`,
				{
					headers: { Accept: 'application/json' },
				},
			);

			if (!response.ok) return;

			const data = await response.json();
			const style = data?.style;
			const freshOptions = Array.isArray(style?.options)
				? style.options
				: [];

			activeGrid.replaceChildren(...freshOptions.map(createAvatarOption));
			refreshOptionList();

			const previewImage = activeStyleButton?.querySelector('img');
			if (previewImage && style?.preview) {
				previewImage.src = style.preview;
			}

			selectAvatar(activeGrid.querySelector('[data-avatar-value]'));
		} finally {
			refreshButton.disabled = false;
			refreshButton.classList.remove('is-loading');
		}
	}

	styles.forEach((styleButton) => {
		styleButton.addEventListener('click', () => selectStyle(styleButton));
	});

	options.forEach((option) => {
		option.addEventListener('click', () => selectAvatar(option));
	});

	backgroundInput?.addEventListener('input', () => {
		setAvatarBackground(backgroundInput.value);
	});

	refreshButton?.addEventListener('click', refreshActiveStyle);

	setAvatarBackground(backgroundInput?.value || '#f7c59f');
}

function initTooltips(scope) {
	if (!window.bootstrap?.Tooltip) return;

	scope.querySelectorAll('.has-tooltip').forEach((element) => {
		bootstrap.Tooltip.getOrCreateInstance(element, {
			trigger: 'hover',
			delay: { show: 1000, hide: 0 },
		});
	});
}

async function loadAvatarModal() {
	const existingModal = document.querySelector('#profileAvatarModal');

	if (existingModal) {
		return existingModal;
	}

	const url = modalTrigger?.dataset.avatarModalUrl;

	if (!url) {
		return null;
	}

	modalTrigger.disabled = true;

	try {
		const response = await fetch(url, {
			headers: { Accept: 'text/html' },
		});

		if (!response.ok) {
			return null;
		}

		const wrapper = document.createElement('div');
		wrapper.innerHTML = await response.text();

		const modal = wrapper.querySelector('#profileAvatarModal');

		if (!modal) {
			return null;
		}

		document.body.append(modal);
		initProfileAvatarPicker(modal);
		initTooltips(modal);

		return modal;
	} finally {
		modalTrigger.disabled = false;
	}
}

modalTrigger?.addEventListener('click', async () => {
	const modal = await loadAvatarModal();

	if (!modal || !window.bootstrap?.Modal) {
		return;
	}

	bootstrap.Modal.getOrCreateInstance(modal).show();
});
