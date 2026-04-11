# DWD.ejs

A modern full-stack web application built as a personal portfolio and playground for showcasing projects.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** EJS, Bootstrap, Bootstrap Icons, Google Fonts
- **Database:** MySQL
- **Authentication:** Passport.js (Local + OAuth)
- **Internationalization:** i18n (ar / en / fr)
- **Security:** Helmet, rate limiting, token-based flows
- **Logging & Monitoring:** Custom logger, Sentry (planned/optional)

---

## 🔐 Authentication Features

### Local Authentication

- Signup with email & password
- Email verification
- Secure password reset flow
- Profanity filtering for usernames

### OAuth Providers

- Google
- GitHub
- Discord

### OAuth Flow Highlights

- Shared OAuth logic via reusable service
- Automatic account linking by email
- Fallback handling for missing provider emails (e.g. GitHub API)
- Username completion step for new OAuth users

---

## 🌍 Internationalization

Supported languages:

- English (en)
- French (fr)
- Arabic (ar)

Features:

- Language-aware routes
- Locale stored via cookies
- Email links preserve language context

---

## 🛡️ Security Features

- Password hashing
- Token-based flows (verification, reset)
- Rate limiting for sensitive actions
- Helmet for HTTP headers protection
- Safe OAuth handling

---

## 📂 Project Structure

- Please see it on .structure.json

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`.

---

## 🧠 Architecture Highlights

- **Separation of concerns**:
    - Controllers → request/response
    - Services → business logic
    - Models → database access

- **Reusable OAuth system**:
    - Single shared `createOAuthVerifyCallback`
    - Provider-specific strategies stay minimal

- **Scalable design**:
    - Easy to plug new OAuth providers
    - Centralized validation and security

---

## 📌 Goals of This Project

- Build a clean and scalable Node.js architecture
- Showcase authentication systems (local + OAuth)
- Demonstrate production-level practices
- Serve as a base for future projects

---

## 📖 Notes

This project is actively evolving.
Expect improvements in:

- UI/UX
- Additional features
- Performance optimizations

---

## 👨‍💻 Author

Developed by Dakermanji
