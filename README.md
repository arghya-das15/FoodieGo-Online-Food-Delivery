# FoodieGo — 200 Feature Build

This is the upgraded FoodieGo front-end based on the previous working V2.
It retains the existing customer/authentication/admin/restaurant-owner/support/checkout/order flows
and adds a searchable, filterable 200-feature project hub.

Some advanced items such as real payment processing, GPS/live maps, OTP delivery, AI inference,
database persistence, and external APIs remain demo/UI-ready until a backend/service is connected.
Open index.html in a modern browser.


## Backend / Full-stack phase

A Node.js backend is included in `backend/server.js`.

### Run
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm start`.
4. Open `http://localhost:3000`.

The API provides:
- `/api/health`
- `/api/auth/signup`
- `/api/auth/login`
- `/api/users`
- `/api/orders`
- `/api/tickets`
- `/api/notifications`
- `/api/settings`
- `/api/stats`

Data is stored in `backend/data/db.json` for a simple college-project demo. Passwords are hashed with SHA-256 by the server. For production, use a real database, salted password hashing such as Argon2/bcrypt, sessions/JWT, HTTPS, payment gateway, maps/GPS and external AI services.

The existing browser UI remains usable without the backend through localStorage; the backend is the next integration layer.

# FoodieGo 200 — Production-Ready College Build

## Run
1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Real authentication
Login/signup now use the backend, bcrypt password hashing and JWT sessions.

Demo accounts:
- Admin: admin@foodiego.com / admin123
- Restaurant owner: owner@foodiego.com / owner123
- Delivery partner: delivery@foodiego.com / delivery123

## Real payment integration
Razorpay Standard Checkout is wired as a server-side integration. Add your Razorpay test keys to `.env`:
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

Use test mode first. The server creates a Razorpay order and verifies the returned payment signature before treating the payment as verified.

## Real order tracking
Order status and delivery events are persisted in SQLite. The customer tracking UI reads the backend order and event timeline. Live GPS requires a maps/GPS provider and delivery device coordinates; this package does not invent GPS data.

## Backend roles
Admin, Restaurant Owner and Delivery Partner have role-protected API endpoints. The existing dashboards can be connected to these endpoints.

## Database
SQLite is used through `better-sqlite3`. The database is created at `backend/data/foodiego.db` on first run.


## Fixed run instructions

For Windows, double-click `RUN_FOODIEGO.bat`. It checks Node.js, installs dependencies and starts the server.
Do not open `index.html` directly for the full-stack build; use `http://localhost:3000`.

The Express 5 catch-all route and demo-account password hashing have been fixed.
The SQLite dependency is pinned to a Node 18+ compatible major version.
