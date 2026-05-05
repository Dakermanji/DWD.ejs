//! models/User.js

import * as auth from './user/auth.js';
import * as preferences from './user/preferences.js';
import * as profile from './user/profile.js';
import * as session from './user/session.js';

export * from './user/auth.js';
export * from './user/preferences.js';
export * from './user/profile.js';
export * from './user/session.js';

export default {
	...auth,
	...preferences,
	...profile,
	...session,
};
