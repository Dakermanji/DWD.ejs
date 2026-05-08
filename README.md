# DWD.ejs

DWD.ejs is a personal showcase website and full-stack Express/EJS playground. It started as a portfolio, but the codebase now also explores production-style account flows: local auth, OAuth, profile settings, social relationships, language/theme preferences, and token-based email confirmations.

The app is intentionally server-rendered. EJS handles views, Bootstrap handles the UI layer, PostgreSQL stores account/session data, and Passport powers local and OAuth authentication.

## Stack

- Node.js and Express
- EJS with `express-ejs-layouts`
- Bootstrap and Bootstrap Icons
- PostgreSQL through `pg`
- Passport local, Google, GitHub, and Discord strategies
- `express-session` with `connect-pg-simple`
- i18next filesystem translations
- Nodemailer for auth and account emails
- Helmet, Morgan, Winston, and optional Sentry
- DiceBear avatars and `flag-icons`

## Current Features

### Public Site

- Home page sections for hero, about, services, portfolio, and contact
- Localized content in Arabic, English, and French
- Theme preference support for system, light, and dark
- Language switcher with return-to-current-page behavior

### Authentication

- Local email-first signup
- Email verification before completing local signup
- Username completion for OAuth users
- Password hashing with bcrypt
- Password reset through short-lived email tokens
- Google, GitHub, and Discord OAuth sign-in
- OAuth account linking from Profile
- Route guards for authenticated users and incomplete signup users

### Profile

- Account overview with editable username and country
- DiceBear avatar picker with style, background color, and refresh support
- Password status with add/change password modal
- Connected login methods for Email, Google, GitHub, and Discord
- Preferences for theme and preferred language
- Danger Zone account deletion flow:
  - type `delete_{username}` first
  - receive a short-lived email confirmation token
  - confirm deletion from the email link

### Social Layer

- Follow requests
- Followers and followees
- Blocking
- Notifications

## Requirements

- Node.js 20 or newer
- PostgreSQL
- SMTP credentials for outgoing emails
- OAuth application credentials for Google, GitHub, and Discord

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Fill the required values:

```env
SESSION_SECRET=some_very_long_secret_more_than_32_characters
DB_PASSWORD=your_password
EMAIL_ADMIN=your_email@domain.com
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=your_email_provider
EMAIL_HOST=your_smtp_host
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
```

Create the database and run the SQL files in order:

```txt
sql/01_session.sql
sql/02_users.sql
sql/03_user_providers.sql
sql/04_auth_tokens.sql
sql/05_auth_security.sql
sql/06_auth_security_events.sql
sql/07_signup_security.sql
sql/08_user_follow_requests.sql
sql/09_user_follows.sql
sql/10_user_blocks.sql
sql/11_user_social_notifications.sql
```

Start the development server:

```bash
npm run dev
```

Start without watch mode:

```bash
npm start
```

## Environment

The normalized runtime config lives in `config/dotenv.js`. Values come from `.env`.

Important groups:

- App: `PORT`, `NODE_ENV`, `CLIENT_URL`
- Session: `SESSION_SECRET`
- PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`
- Email: `EMAIL_ADMIN`, `EMAIL_PASSWORD`, `EMAIL_SERVICE`, `EMAIL_HOST`, `EMAIL_PORT`
- OAuth: Google, GitHub, and Discord client IDs/secrets/callback URLs
- Monitoring: `SENTRY_DSN`

## Architecture

The project follows a simple separation:

- `controllers/`: request and response handling
- `routes/`: route definitions and middleware wiring
- `services/`: business logic and reusable flows
- `models/`: database access
- `middlewares/`: Express app middleware
- `views/`: EJS pages, layouts, modals, and partials
- `public/`: CSS, JS, images, favicons
- `locales/`: i18next namespace JSON files
- `sql/`: database schema setup scripts

`.structure.json` is maintained as the project map.

## Auth Flow Notes

Token-based flows store only hashed tokens in the database. Current token types:

- `signup_verification`
- `password_reset`
- `account_deletion`

Account deletion uses a shorter token lifetime than the default auth token lifetime.

OAuth is centralized through `services/auth/oauth.js`, with provider-specific Passport setup kept in `config/passport/strategies`.

## Localization

Supported language codes are defined in `config/languages.js`:

- `ar`
- `en`
- `fr`

Translation namespaces are configured in `config/i18n.js`. Profile-specific strings live in `locales/{lang}/profile.json`.

## Notes

This project is still evolving. Some features are intentionally built as foundations for later work, especially Profile widgets, richer account linking, activity summaries, and future showcase project integrations.

## Author

Developed by Behnam Dakermanji.
