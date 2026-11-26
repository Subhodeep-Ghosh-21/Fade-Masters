# Fade Masters

Fade Masters is an India-focused salon marketplace prototype with a same-origin Node.js API and SQLite persistence.

## Run locally

1. Install Node.js 22.5 or later (the API uses Node's built-in `node:sqlite`; no npm packages are required).
2. Start the server with `npm start`.
3. Open `http://localhost:3000`.

The SQLite database is created at `data/fade-masters.sqlite`. Set `DB_PATH` to use another file and `PORT` to change the listening port. Do not expose this development server directly to the public internet.

Customers and shop owners create their own accounts from the login screen. Barber accounts can only be created by an authenticated owner in that owner's shop roster. The generated employee ID and temporary password are shown in the owner UI as an invite preview; no email is sent.

## Optional Google Places discovery

Registered shops with latitude/longitude are searchable in-app using the browser's location permission and the server's `/api/shops/nearby` endpoint. To additionally request Google Places results, configure a restricted Places API key in the server environment:

```powershell
$env:GOOGLE_MAPS_API_KEY = "your-restricted-server-key"
npm start
```

Restrict the key to the Places API and your server/network as appropriate. The key stays on the server. Places results are external discovery only and cannot be booked through Fade Masters. Without a key, the app offers an external Google Maps search and still searches Fade Masters-registered shops.

## Security and prototype boundaries

- Passwords are hashed with `scrypt`; the browser never receives password hashes.
- Sessions use random opaque tokens in `HttpOnly`, `SameSite=Strict` cookies. HTTPS deployments must set `COOKIE_SECURE=1` and terminate TLS at a trusted proxy.
- APIs enforce customer, barber, and owner roles and shop ownership. SQLite uses foreign keys, transactional writes, and appointment-slot uniqueness.
- The database is local SQLite; configure backups and a production-grade deployment before handling real customer data.
- Appointment payment records, memberships, salary, incentives, and 1–5% platform commissions are demo records/estimates only. There is no payment processor, payroll transfer, or commission collection.
- Owner barber invites are previews only; no email provider is configured. Password reset is not available.
- The app does not import unregistered or fabricated salon listings. New shops become discoverable only after an owner registers them. The seeded service catalog is not a claim that any shop offers a service.

## Checks

Run `npm test` for API integration tests. The browser app is served by the same process, so API requests use same-origin cookies.
