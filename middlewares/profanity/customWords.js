//! middlewares/profanity/customWords.js

/**
 * Project-specific profanity additions
 * ------------------------------------
 * Why this file exists:
 * - lets us block words not covered by the package defaults
 * - lets us add reported bypasses later
 * - keeps project-specific moderation rules separate from validator logic
 *
 * Notes:
 * - add reported split/obfuscated words in collapsed form when possible
 * - example: if a username bypasses with "b a d w o r d", store "badword"
 */

export const CUSTOM_PROFANITY_WORDS = [
	// Add project-specific blocked words here.
];

export const PROFANITY_WHITELIST = [
	// Add false positives here if needed later.
];
