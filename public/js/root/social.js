//! public/js/root/social.js

const notificationsCollapse = document.getElementById('socialNotifications');
const notificationsBody = document.getElementById('socialNotificationsBody');

if (notificationsCollapse && notificationsBody) {
	notificationsCollapse.addEventListener('show.bs.collapse', () => {
		void loadNotifications();
	});
}

async function loadNotifications() {
	const url = notificationsBody.dataset.url;

	renderMessage(notificationsBody.dataset.loadingLabel);

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
}

function createNotificationItem(notification) {
	const item = document.createElement('article');
	item.className = 'list-group-item px-0';

	const title = document.createElement('div');
	title.className = 'fw-semibold';
	title.textContent = buildNotificationTitle(notification);

	const meta = document.createElement('div');
	meta.className = 'small text-body-secondary mt-1';
	meta.textContent = formatNotificationDate(notification.created_at);

	item.append(title, meta);

	return item;
}

function buildNotificationTitle(notification) {
	const actorName =
		notification.actor_username || notificationsBody.dataset.someoneLabel;

	if (notification.type === 'follow_request') {
		return `${actorName} ${notificationsBody.dataset.followRequestLabel}`;
	}

	return actorName;
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
