//! middlewares/profanity/index.js

/**
 * Profanity validation helpers
 * ----------------------------
 * Reusable profanity detection helpers for usernames and future user content.
 */

import { Profanity } from '@2toad/profanity';
import { CUSTOM_PROFANITY_WORDS, PROFANITY_WHITELIST } from './customWords.js';

const profanity = new Profanity({
	languages: ['en', 'fr'],
	wholeWord: true,
	unicodeWordBoundaries: true,
});

if (CUSTOM_PROFANITY_WORDS.length > 0) {
	profanity.addWords(CUSTOM_PROFANITY_WORDS);
}

if (PROFANITY_WHITELIST.length > 0) {
	profanity.whitelist.addWords(PROFANITY_WHITELIST);
}

/**
 * Normalize text for profanity checks.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeProfanityText(value) {
	return String(value ?? '')
		.normalize('NFKC')
		.trim()
		.toLowerCase();
}

/**
 * Collapse separators and symbols so split profanity like:
 * - f u c k
 * - f.u.c.k
 * - f_u-c k
 * can still be detected.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function collapseProfanityText(value) {
	return normalizeProfanityText(value).replace(/[^\p{L}\p{N}]+/gu, '');
}

/**
 * Check whether text contains profanity.
 *
 * Strategy:
 * - check the normalized original text
 * - also check a collapsed form to catch split/obfuscated words
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function containsProfanity(value) {
	const normalizedValue = normalizeProfanityText(value);

	if (!normalizedValue) {
		return false;
	}

	if (profanity.exists(normalizedValue)) {
		return true;
	}

	const collapsedValue = collapseProfanityText(normalizedValue);

	if (collapsedValue && collapsedValue !== normalizedValue) {
		return profanity.exists(collapsedValue);
	}

	return false;
}

/**
 * Validate that text does not contain profanity.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function validateNoProfanity(value) {
	return !containsProfanity(value);
}
