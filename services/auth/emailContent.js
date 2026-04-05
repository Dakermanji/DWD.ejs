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

const resetPasswordEmailContent = {
	en: {
		subject: 'Reset your password',
		html: (url) => `
			<div dir="ltr">
				<p>You requested to reset your password.</p>
				<p>Click the link below to set a new password:</p>
				<p><a href="${url}">${url}</a></p>
				<p>If you did not request this, you can safely ignore this email.</p>
			</div>
		`,
	},

	ar: {
		subject: 'إعادة تعيين كلمة المرور',
		html: (url) => `
			<div dir="rtl">
				<p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.</p>
				<p>اضغط على الرابط أدناه لتعيين كلمة مرور جديدة:</p>
				<p><a href="${url}">${url}</a></p>
				<p>إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.</p>
			</div>
		`,
	},

	fr: {
		subject: 'Réinitialisez votre mot de passe',
		html: (url) => `
			<div dir="ltr">
				<p>Vous avez demandé à réinitialiser votre mot de passe.</p>
				<p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
				<p><a href="${url}">${url}</a></p>
				<p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p>
			</div>
		`,
	},
};

export default {
	signupEmailContent,
	resetPasswordEmailContent,
};
