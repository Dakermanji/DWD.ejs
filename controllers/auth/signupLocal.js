//! controllers/auth/signupLocal.js

/**
 * Local signup Controller
 *
 * Responsibilities:
 * - Handle the first step of local signup
 * - Accept email-only signup requests
 * - Later trigger token creation and signup completion email
 *
 * Why this file exists:
 * - Keeps local signup logic isolated from route definitions
 * - Prepares the project for the email-first signup flow
 *
 * Planned flow:
 * 1. Read and normalize email from request body
 * 2. Validate email
 * 3. Check whether the email can start signup
 * 4. Create or reuse pending user record
 * 5. Create signup completion token
 * 6. Send completion email
 *
 * Notes:
 * - This is intentionally an empty scaffold for now
 * - Real logic will be added step-by-step
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export default async function signupLocal(req, res, next) {
	// Local signup logic will be added later.
}
