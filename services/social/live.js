//! services/social/live.js

let socialSocketServer = null;

/**
 * Register the Socket.IO server used for social events.
 *
 * @param {import('socket.io').Server} io
 * @returns {void}
 */
export function setSocialSocketServer(io) {
	socialSocketServer = io;
}

/**
 * Notify signed-in users that their social counts changed.
 *
 * @param {Array<string | null | undefined>} userIds
 * @returns {void}
 */
export function emitSocialCountsChanged(userIds) {
	if (!socialSocketServer) return;

	for (const userId of new Set(userIds.filter(Boolean))) {
		socialSocketServer
			.to(getSocialUserRoom(userId))
			.emit('social:counts:changed');
	}
}

export function getSocialUserRoom(userId) {
	return `social:user:${userId}`;
}
