//! config/navbar.js

/**
 * Navigation configuration
 * ------------------------
 * - Defines navigation items per page/route
 * - Used by layout/header to render menus dynamically
 *
 * Notes:
 * - Labels are i18n keys (resolved in views)
 * - Icons reference Bootstrap Icons class names
 */

export const navbar = {
	index: [
		{
			link: '#about',
			label: 'nav:about',
			icon: 'bi-file-person',
		},
		{
			link: '#services',
			label: 'nav:services',
			icon: 'bi-boxes',
		},
		{
			link: '#portfolio',
			label: 'nav:portfolio',
			icon: 'bi-person-workspace',
		},
		{
			link: '#contact',
			label: 'nav:contact',
			icon: 'bi-telephone',
		},
	],
};
