# Technical Requirements Document (TRD)

**Version:** 0.1 (draft). Stack choices below are proposals; change them if your team prefers something else.

---

## 1. Architecture Overview

```
 Browser (PWA, mobile + desktop)
   Next.js / React  ── Leaflet + OpenStreetMap
        │  HTTPS                │ WebSocket (Realtime)
        ▼                       ▼
 ┌──────────────────────────────────────────────┐
 │ Supabase                                     │
 │  • Postgres + PostGIS (data, geo queries)    │
 │  • Auth (email / phone OTP)                  │
 │  • Realtime (listing + location updates)     │
 │  • Storage (pickup photos, certificates)     │
 │  • Edge Functions + pg_cron (jobs)           │
 └──────────────────────────────────────────────┘
        │
        ├─ Routing API (OSRM / OpenRouteService) – ETA + route line
        ├─ Web Push (VAPID) – notifications
        ├─ Email provider (Resend / SendGrid / SES) – approvals, reports
        └─ RSS sources – news ingestion (admin approved)
```

## 2. Technology Stack (proposed)

| Layer | Choice | Reason |
|---|---|---|
| Front end | Next.js (React) + TypeScript | Fast to build, SSR for public pages, PWA support |
| Styling | Tailwind CSS | Quick responsive UI |
| Maps | Leaflet + OpenStreetMap tiles | Free; sufficient for pins, routes, live marker |
| Backend | Supabase (Postgres, Auth, Realtime, Storage) | One service covers most needs; low ops |
| Geo | PostGIS | "NGOs within X km", geofence checks |
| Routing | OSRM or OpenRouteService | Free-tier ETA and route line |
| Hosting | Vercel (front end), Supabase cloud | Low cost, simple deploys |
| Push | Web Push API (VAPID) | No app store needed |
| Monitoring | Sentry + Supabase logs | Error tracking |
| Email | Resend or similar | Transactional email |
| PDF | Server-side HTML→PDF in an Edge Function or small Node service | Monthly certificates |

## 3. Key Technical Requirements

### 3.1 PWA
- Web app manifest, icons, `display: standalone`, install prompt.
- Service worker: cache app shell and static assets; network-first for data. Full offline mode is out of scope for MVP.
- HTTPS required (geolocation, push, service worker).

### 3.2 Live Location Tracking
- Use `navigator.geolocation.watchPosition` in the collector's browser only while the pickup status is *On the way*.
- Request Screen Wake Lock (`navigator.wakeLock`) to keep the screen on during the pickup, and show a prompt: "Keep this screen open while collecting."
- Send a ping every 5–10 s (throttled; skip if movement < ~10 m): `{pickup_id, lat, lng, accuracy, ts}`.
- Write pings to `location_pings`; clients subscribe to inserts for that pickup via Realtime.
- Stop watching at *Collected* or on cancel.
- **Limitation:** browsers cannot reliably track in the background, especially iOS Safari. Fallback is status milestones plus last-known position with a "last updated X min ago" label.
- Retention: delete pings 30 days after the pickup completes (scheduled job).

### 3.3 Map
- Layers: open listings (pins by urgency: green > 2 h, amber 1–2 h, red < 1 h), NGOs, active pickup (collector marker, route line, ETA).
- Cluster pins when zoomed out.
- ETA from routing API on status change and every ~60 s, not on every ping.

### 3.4 Atomic Claiming
- Claiming uses a single database function with a conditional update (`where status = 'posted'`) so two NGOs cannot claim the same listing. Return a clear error to the loser.

### 3.5 Handoff Verification
- Geofence: collector's position must be within ~150 m of the hotel (configurable) when marking *Collected*; otherwise show a warning and flag the report.
- Pickup photo required at completion.
- Optional static QR at the hotel kitchen door (printed) that the collector scans; this needs no hotel action.

### 3.6 Scoring Engine
- Scheduled job (weekly, via `pg_cron` or a scheduled Edge Function) computes per-hotel signals over a 60-day window and writes `score_snapshots`.
- Constants (weights, smoothing k, minimum pickups, benchmark coefficients) live in a `settings` table editable by admin.
- Voiding or correcting a report triggers recompute for the affected hotel.
- Public leaderboard reads only from the latest snapshot.

### 3.7 Notifications
- In-app notification centre (table + Realtime).
- Web Push for supported browsers. Note: on iOS, push works only after the PWA is installed to the home screen (iOS 16.4+).
- Email for approvals, monthly certificates and complaint replies.
- Fallback (later): SMS/WhatsApp via a provider if push adoption is low.

### 3.8 News Ingestion
- Admin-managed list of RSS sources; a scheduled function fetches items into a `news_items` table in *draft*.
- Admin approves/pins. Store title, link, source, short snippet (not full article text) to respect copyright.
- Internal stories and rescue milestones are created by admin or auto-generated from data (e.g., "Hotel X reached 5,000 meals").

### 3.9 Impact Passport
- Monthly job generates a PDF certificate per hotel from verified data and stores it in Storage.
- Public badge: an embeddable script or image URL (e.g., `/badge/{hotel_slug}.svg`) showing live meals rescued and tier. Cache for a few minutes.

## 4. API Surface (Next.js route handlers or Supabase RPC)

| Area | Endpoint / RPC | Role |
|---|---|---|
| Auth | Supabase Auth | all |
| Listings | `POST /listings`, `GET /listings?bbox&status`, `PATCH /listings/:id/cancel` | hotel / ngo |
| Claim | `rpc claim_listing(listing_id, ngo_id, volunteer_id)` | ngo |
| Pickup | `PATCH /pickups/:id/status`, `POST /pickups/:id/pings`, `POST /pickups/:id/report` | volunteer |
| Photos | Signed upload URLs to private bucket | volunteer |
| Leaderboard | `GET /leaderboard?category` | public |
| Hotel dashboard | `GET /hotels/:id/dashboard` | hotel (own) |
| News | `GET /news`, admin CRUD | public / admin |
| Social | `POST /kudos`, `POST/DELETE /follows` | public user |
| Admin | approve org, flag queue, void/correct report, settings | admin |

## 5. Security & Privacy

- Row-Level Security on every table; policies per role (see Schema document).
- Hotels see only their own listings and score; NGOs see open listings and their own pickups; public sees only public aggregates and news.
- Collector location visible only to the hotel, NGO and admin for that pickup, and only while active.
- Photos in a private bucket with short-lived signed URLs.
- Rate limiting on auth, pings and kudos; basic bot protection (CAPTCHA) on public sign-up.
- Input validation (server-side) for all writes; sanitize any user-entered text.
- Audit log for admin actions (void, correct, suspend).
- Store the minimum personal data; document a privacy policy; allow account deletion.

## 6. Performance & Scale (pilot)

- Target: a few hundred concurrent users; free/low-tier hosting is adequate.
- Index geospatial and status columns; paginate lists.
- Realtime subscriptions scoped to a specific pickup or listing area to limit traffic.

## 7. Testing

- Unit tests: score calculations, claim logic, geofence check.
- Integration tests: end-to-end flow (post → claim → track → report → score).
- Manual device testing on iOS Safari and Android Chrome (location permission, wake lock, push, camera upload).
- Seed script producing demo hotels, NGOs and pickups for QA and demos.
- Simulated movement script to test the live map without walking around.

## 8. Deployment & Environments

- Environments: local, staging, production (separate Supabase projects).
- CI: lint, type-check, tests on pull request; auto-deploy to staging on merge.
- Secrets via environment variables; never in the client bundle.
- Database migrations versioned in the repo.
- Daily automated database backups.

## 9. Technical Risks

| Risk | Mitigation |
|---|---|
| iOS background location and push limits | Foreground tracking during pickups only; install-to-home-screen prompt; status fallback |
| GPS inaccuracy | Use accuracy value; geofence tolerance; photo as secondary proof |
| Free map/routing tier limits | Cache routes; consider paid tier or self-hosted OSRM later |
| Realtime load | Scoped channels; batch pings |
| Score tuning | Settings table; snapshot history; re-run capability |

## 10. Open Technical Questions

- Is Supabase acceptable, or should the backend be custom (Node/Django)?
- Who will build and maintain the app (team size and skills)?
- Is there a budget for paid map, SMS or WhatsApp services?
- Data residency requirements for hosting region?
