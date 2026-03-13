//! public/js/root/dropdownMenu.js

/**
 * Header / navbar behaviors
 * - Collapses the mobile navbar when clicking outside of it
 * - Preserves expected Bootstrap dropdown interactions
 *
 * Notes:
 * - Designed for Bootstrap 5 navbar behavior.
 * - Assumes Bootstrap JS bundle is available globally.
 */

// Target all collapsible navbars (mobile view)
const navbarCollapses = document.querySelectorAll('.navbar-collapse');

/**
 * Collapse open navbars when clicking outside,
 * while ignoring interactions inside dropdowns.
 */
document.addEventListener('click', (event) => {
	// Check if bootstrap exist
	if (!window.bootstrap) return;

	// Check if the click occurred inside an open dropdown
	const inOpenDropdown =
		event.target.closest('.dropdown-menu.show') ||
		event.target.closest(
			'[data-bs-toggle="dropdown"][aria-expanded="true"]',
		);

	// Allow normal dropdown interaction
	if (inOpenDropdown) return;

	// Defer collapse slightly to avoid race conditions
	// with Bootstrap's internal click handlers
	setTimeout(() => {
		navbarCollapses.forEach((collapseEl) => {
			const clickedInsideThisNavbar = collapseEl
				.closest('.navbar')
				?.contains(event.target);

			if (
				collapseEl.classList.contains('show') &&
				!clickedInsideThisNavbar
			) {
				const collapseInstance =
					bootstrap.Collapse.getInstance(collapseEl);
				collapseInstance?.hide();
			}
		});
	}, 10);
});
