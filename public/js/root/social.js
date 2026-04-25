//! public/js/root/social.js

const notificationsCollapse = document.getElementById('socialNotifications');
const notificationsBody = document.getElementById('socialNotificationsBody');

if (notificationsCollapse && notificationsBody) {
	notificationsCollapse.addEventListener('show.bs.collapse', () => {
		void loadNotifications();
	});

	notificationsBody.addEventListener('click', (event) => {
		const button = event.target.closest('[data-social-action]');

		if (!button) return;

		event.preventDefault();
		void runSocialAction(button);
	});
}

async function loadNotifications() {
	const url = notificationsBody.dataset.url;

	renderLoadingState();

	try {
		const response = await fetch(url, {
			headers: {
				Accept: 'application/json',
			},
			credentials: 'same-origin',
		});

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		const payload = await response.json();

		if (!payload?.ok || !Array.isArray(payload.notifications)) {
			throw new Error('Invalid notifications payload');
		}

		renderNotifications(payload.notifications);
	} catch (error) {
		console.error('Failed to load social notifications', error);
		renderMessage(notificationsBody.dataset.errorLabel);
	}
}

function renderNotifications(notifications) {
	notificationsBody.replaceChildren();

	if (notifications.length === 0) {
		renderMessage(notificationsBody.dataset.emptyLabel);
		return;
	}

	const list = document.createElement('div');
	list.className = 'list-group list-group-flush';

	for (const notification of notifications) {
		list.appendChild(createNotificationItem(notification));
	}

	notificationsBody.appendChild(list);
	initTooltipsIn(notificationsBody);
}

function createNotificationItem(notification) {
	const item = document.createElement('article');
	item.className = 'list-group-item position-relative';

	const title = document.createElement('div');
	title.className = 'fw-semibold social-notification-title';
	title.append(...buildNotificationTitleParts(notification));

	const meta = document.createElement('div');
	meta.className = 'small text-body-secondary mt-1';
	meta.textContent = formatNotificationDate(notification.created_at);

	item.append(title, meta);

	const { floatingActions, inlineActions } =
		createNotificationActions(notification);

	for (const actionButton of floatingActions) {
		item.appendChild(actionButton);
	}

	if (inlineActions) {
		item.appendChild(inlineActions);
	}

	return item;
}

function buildNotificationTitleParts(notification) {
	const actorName =
		notification.actor_username || notificationsBody.dataset.someoneLabel;
	const actor = document.createElement('span');
	actor.className = 'social-notification-actor';
	actor.textContent = actorName;

	if (notification.actor_email) {
		actor.classList.add('has-tooltip');
		actor.dataset.bsTitle = notification.actor_email;
		actor.tabIndex = 0;
	}

	if (notification.type === 'follow_request') {
		return buildTemplateParts(
			notificationsBody.dataset.followRequestLabel,
			actor,
		);
	}

	if (notification.type === 'follow_started') {
		return buildTemplateParts(
			notificationsBody.dataset.followStartedLabel,
			actor,
		);
	}

	return [actor];
}

function buildTemplateParts(template, actor) {
	const marker = '{{user}}';
	const fallback = [actor];

	if (!template || !template.includes(marker)) {
		fallback.push(document.createTextNode(` ${template || ''}`));
		return fallback;
	}

	const parts = template.split(marker);
	const nodes = [];

	parts.forEach((part, index) => {
		if (part) {
			nodes.push(document.createTextNode(part));
		}

		if (index < parts.length - 1) {
			nodes.push(actor);
		}
	});

	return nodes;
}

function formatNotificationDate(value) {
	if (!value) return '';

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return '';

	return new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(date);
}

function renderMessage(message) {
	notificationsBody.replaceChildren();

	const paragraph = document.createElement('p');
	paragraph.className = 'text-body-secondary mb-0';
	paragraph.textContent = message;

	notificationsBody.appendChild(paragraph);
}

function renderLoadingState() {
	notificationsBody.replaceChildren();

	const wrapper = document.createElement('div');
	wrapper.className = 'd-flex align-items-center justify-content-center py-3';

	const spinner = document.createElement('div');
	spinner.className = 'spinner-border spinner-border-sm text-primary';
	spinner.setAttribute('role', 'status');

	const label = document.createElement('span');
	label.className = 'visually-hidden';
	label.textContent = notificationsBody.dataset.loadingLabel;

	spinner.appendChild(label);
	wrapper.appendChild(spinner);
	notificationsBody.appendChild(wrapper);
}

function createNotificationActions(notification) {
	const actionConfigs = getNotificationActions(notification);

	if (actionConfigs.length === 0) {
		return {
			floatingActions: [],
			inlineActions: null,
		};
	}

	const container = document.createElement('div');
	container.className = 'd-flex flex-wrap gap-2 mt-3';
	const floatingActions = [];

	for (const config of actionConfigs) {
		const button = createActionButton(config);

		if (config.floating) {
			floatingActions.push(button);
			continue;
		}

		container.appendChild(button);
	}

	return {
		floatingActions,
		inlineActions: container.childElementCount > 0 ? container : null,
	};
}

function getNotificationActions(notification) {
	return Array.isArray(notification.actions)
		? notification.actions.map((action) => normalizeActionConfig(action))
		: [];
}

function normalizeActionConfig(action) {
	const baseConfig = {
		payload: action,
		floating: action.name === 'ignore_notification',
	};

	if (action.name === 'accept_follow_request') {
		return {
			...baseConfig,
			className: 'social-action--accept',
			icon: 'bi-check2',
			label: notificationsBody.dataset.acceptLabel,
		};
	}

	if (action.name === 'follow_back') {
		return {
			...baseConfig,
			className: 'social-action--follow-back',
			icon: 'bi-repeat',
			label: notificationsBody.dataset.followBackLabel,
		};
	}

	if (action.name === 'reject_follow_request') {
		return {
			...baseConfig,
			className: 'social-action--decline',
			icon: 'bi-x-lg',
			label: notificationsBody.dataset.declineLabel,
		};
	}

	if (action.name === 'block_user') {
		return {
			...baseConfig,
			className: 'social-action--block',
			icon: 'bi-ban',
			label: notificationsBody.dataset.blockLabel,
		};
	}

	if (action.name === 'ignore_notification') {
		return {
			...baseConfig,
			className: 'social-action--ignore',
			icon: 'bi-x',
			label: notificationsBody.dataset.ignoreLabel,
			floating: true,
		};
	}

	return {
		...baseConfig,
		className: 'social-action--default',
		icon: 'bi-circle',
		label: action.name,
	};
}

function createActionButton(config) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = config.floating
		? `social-action social-action--floating ${config.className} has-tooltip`
		: `social-action ${config.className} has-tooltip`;
	button.dataset.socialAction = config.payload.name;
	button.dataset.socialPayload = JSON.stringify(config.payload);
	button.dataset.bsTitle = config.label;
	button.setAttribute('aria-label', config.label);

	const icon = document.createElement('i');
	icon.className = `bi ${config.icon}`;
	button.appendChild(icon);

	if (!config.floating) {
		const text = document.createElement('span');
		text.className = 'visually-hidden';
		text.textContent = config.label;
		button.appendChild(text);
	}

	return button;
}

async function runSocialAction(button) {
	const url = notificationsBody.dataset.actionUrl;
	let payload;

	try {
		payload = JSON.parse(button.dataset.socialPayload);
	} catch {
		console.error('Invalid social action payload');
		return;
	}

	setActionButtonsDisabled(true);

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			credentials: 'same-origin',
			body: JSON.stringify({
				action: payload.name,
				targetUserId: payload.targetUserId,
				followRequestId: payload.followRequestId,
				notificationId: payload.notificationId,
			}),
		});

		const payload = await response.json();

		if (!response.ok || !payload?.ok) {
			throw new Error(payload?.error || 'Notification action failed');
		}

		await loadNotifications();
	} catch (error) {
		console.error('Failed to run social action', error);
		renderActionError(notificationsBody.dataset.actionErrorLabel);
	} finally {
		setActionButtonsDisabled(false);
	}
}

function renderActionError(message) {
	const existingAlert = notificationsBody.querySelector(
		'[data-social-action-error]',
	);

	if (existingAlert) {
		existingAlert.remove();
	}

	const alert = document.createElement('div');
	alert.className = 'alert alert-danger py-2 px-3 mb-3';
	alert.dataset.socialActionError = 'true';
	alert.textContent = message;

	notificationsBody.prepend(alert);
}

function setActionButtonsDisabled(disabled) {
	notificationsBody
		.querySelectorAll('[data-social-action]')
		.forEach((button) => {
			button.disabled = disabled;
		});
}
