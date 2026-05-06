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
