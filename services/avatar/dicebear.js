//! services/avatar/dicebear.js

import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

function svgToDataUri(svg) {
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createUserAvatarDataUri(seed) {
	const avatar = createAvatar(initials, {
		seed,
		radius: 50,
		backgroundColor: ['f7c59f', 'c7d2fe', 'bae6fd', 'bbf7d0'],
	});

	return svgToDataUri(avatar.toString());
}
