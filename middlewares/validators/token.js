//! middlewares/validators/token.js

/**
 * Expected token length for public auth tokens.
 *
 * Current usage:
 * - email verification token
 * - local signup completion token
 */
const TOKEN_LENGTH = 64;

/**
 * Normalize a token-like value.
 *
 * @param {unknown} token
 * @returns {string}
 */
export const normalizeToken = (token) => String(token ?? '').trim();

/**
 * Check whether a token has the expected public format.
 *
 * Current rules:
 * - must be a string-like value
 * - must be exactly 64 characters
 *
 * Notes:
 * - this validates format only
 * - it does not verify that the token exists
 * - it does not verify expiration or usage state
 *
 * @param {unknown} token
 * @returns {boolean}
 */
export const isValidToken = (token) => {
	const normalizedToken = normalizeToken(token);
	return normalizedToken.length === TOKEN_LENGTH;
};
