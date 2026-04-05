//! public/js/home/auth.js

const recoveryForm = document.querySelector('#recoveryModal form');

if (recoveryForm) {
	recoveryForm.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
		}
	});
}
