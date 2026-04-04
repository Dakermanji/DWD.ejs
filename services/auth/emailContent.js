//! services/auth/emailContent.js

const signupEmailContent = {
	en: {
		subject: 'Verify your email',
		html: (verifyUrl) => `
			<div dir="ltr">
				<p>Welcome!</p>
				<p>Click the link below to complete your signup:</p>
				<p><a href="${verifyUrl}">${verifyUrl}</a></p>
				<p>This link expires in 1 hour.</p>
			</div>
		`,
	},
	fr: {
		subject: 'Vérifiez votre adresse e-mail',
		html: (verifyUrl) => `
			<div dir="ltr">
				<p>Bienvenue&nbsp;!</p>
				<p>Cliquez sur le lien ci-dessous pour terminer votre inscription&nbsp;:</p>
				<p><a href="${verifyUrl}">${verifyUrl}</a></p>
				<p>Ce lien expire dans 1 heure.</p>
			</div>
		`,
	},
	ar: {
		subject: 'تحقق من بريدك الإلكتروني',
		html: (verifyUrl) => `
			<div dir="rtl">
				<p>مرحبًا!</p>
				<p>اضغط على الرابط التالي لإكمال التسجيل:</p>
				<p><a href="${verifyUrl}">${verifyUrl}</a></p>
				<p>تنتهي صلاحية هذا الرابط خلال ساعة واحدة.</p>
			</div>
		`,
	},
};

export default {
	signupEmailContent,
};
