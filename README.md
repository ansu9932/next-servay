# next — Survey & Admin Dashboard

A complete, **zero-dependency** survey website and admin dashboard to validate demand for **next**, a fast local delivery app for pincode **721401**.

> **next** — *What do you need next?* The wordmark's final **t** extends into a green forward arrow (the "Forward Motion" mark), echoing the dot in the UI style.

Built with only **Node.js core modules** + vanilla HTML/CSS/JS — no `npm install`, no build step. It runs anywhere Node 18+ is installed.

---

## Why this design

`next` is a **3-sided marketplace** (like Blinkit / Zepto / Instamart), so the survey branches by role to validate each side:

| Side | What we're validating | Sample questions |
|------|----------------------|------------------|
| 🛒 **Customers** | Real demand + unit economics | Would you use it? Acceptable delivery time, delivery-fee tolerance, average order value, payment method (COD vs UPI), categories, NPS |
| 🛵 **Riders** | Delivery-partner supply | Vehicle, hours available, target earnings, area knowledge, smartphone access |
| 🏪 **Merchants** | Inventory supply | Shop type, current delivery habits, order volume, commission tolerance, app comfort |

These are the signals that answer the two big questions: **"Do people actually want this?"** and **"Can it work economically in my city?"**

---

## Run it

```bash
node server.js
```

Then open:

- **Survey:** http://localhost:3000/
- **Admin dashboard:** http://localhost:3000/admin.html

### Configuration (environment variables)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | Port to listen on |
| `ADMIN_PASSWORD` | `next-admin-721401` | Password for the admin dashboard |
| `DATA_DIR` | `./data` | Where responses are stored |

```bash
PORT=8080 ADMIN_PASSWORD="my-secret" node server.js
```

> **Change the admin password before going live.**

---

## Features

**Survey page (`/`)**
- Multi-step wizard with progress bar — feels light on mobile
- Branches by role (customer / rider / merchant) so people only see relevant questions
- Big tap targets, emoji choices, inline validation, conditional "contact" field for the waitlist
- Works on phones, tablets, and desktops (mobile-first, fully responsive)

**Admin dashboard (`/admin.html`)**
- Password-protected (cookie session)
- KPI cards: total responses, demand %, NPS, waitlist count, role split
- Charts (pure SVG/CSS, no libraries): role donut, "would use next?", top categories, delivery-fee willingness, payment mix, top localities
- Searchable / filterable response table with expandable full detail
- One-click **CSV export**

---

## How data is stored

Responses are appended to `data/responses.json` (created automatically). This file is **git-ignored** so real responses stay private. No database required.

---

## Project structure

```
next-servay/
├── server.js              # Node core-only HTTP server + API + storage
├── package.json
├── README.md
├── data/                  # responses.json created at runtime (git-ignored)
└── public/
    ├── index.html         # survey page
    ├── admin.html         # admin dashboard
    ├── css/styles.css     # brand design system (responsive)
    ├── js/survey.js        # survey wizard engine
    ├── js/admin.js         # dashboard + charts
    └── assets/            # logo.svg, favicon.svg
```

## Notes on hosting

Because it's plain Node + static files, you can run it on any small VM, a Raspberry Pi, or any Node host. For public use, put it behind HTTPS (a reverse proxy like Nginx/Caddy) and set a strong `ADMIN_PASSWORD`.
