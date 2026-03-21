//! config/passport/index.js

/**
 * Passport configuration entry point
 *
 * Responsibilities:
 * - Register Passport session handlers
 * - Register all authentication strategies
 *
 * Why this file exists:
 * - Keeps Passport setup in one place
 * - Makes Express auth wiring cleaner
 * - Prepares the project for local and OAuth authentication
 *
 * Notes:
 * - Strategy files are scaffolded only for now
 * - Database logic will be added later when needed
 */

import passport from 'passport';

import setupPassportSession from './serializeUser.js';
import setupLocalStrategy from './strategies/local.js';
import setupGoogleStrategy from './strategies/google.js';
import setupGithubStrategy from './strategies/github.js';
import setupDiscordStrategy from './strategies/discord.js';

/**
 * Initialize Passport strategies and session handlers
 */
function setupPassport() {
	setupPassportSession(passport);

	setupLocalStrategy(passport);
	setupGoogleStrategy(passport);
	setupGithubStrategy(passport);
	setupDiscordStrategy(passport);

	return passport;
}

export default setupPassport;
