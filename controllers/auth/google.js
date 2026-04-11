//! controllers/auth/google.js

import passport from 'passport';

import { handleOAuthCallback } from '../../services/auth/oauth.js';

/**
 * Start Google OAuth flow.
 *
 * Responsibilities:
 * - redirect the user to Google
 * - use one shared entry for signup and signin
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function googleCall(req, res, next) {
	req.session.oauthLocale = req.language || req.resolvedLanguage || 'en';
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		prompt: 'select_account',
	})(req, res, next);
}

/**
 * Handle Google OAuth callback.
 *
 * Responsibilities:
 * - complete Passport authentication for Google OAuth
 * - delegate shared OAuth logic to handleOAuthCallback
 * - keep controller minimal and provider-specific only
 *
 * Flow:
 * - Passport authenticates the request
 * - result (err, user) is passed to shared handler
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export function googleCallback(req, res, next) {
	passport.authenticate('google', (err, user) =>
		handleOAuthCallback(req, res, next, err, user),
	)(req, res, next);
}
