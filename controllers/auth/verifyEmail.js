//! controllers/auth/verifyEmail.js
export async function verifyEmail(req, res) {
	const { token } = req.query;
	return res.send('TODO: verify email token');
}
