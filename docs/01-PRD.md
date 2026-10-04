# Product Requirements Document (PRD)

**Product:** Food Waste Redistribution Platform (working name: *FoodRescue* — placeholder)
**Version:** 0.1 (draft) | **Platform:** Responsive web app (PWA), mobile + desktop

---

## 1. Overview

A web platform where hotels, restaurants, hostels and event venues list surplus cooked food, and verified NGOs/volunteers claim and collect it. A live map shows pickups in progress. A public leaderboard and impact tools give hotels a reason to donate instead of discarding food.

## 2. Problem

- Venues throw away edible food because donating takes effort, timing is tight (1–3 hour window) and there is no easy way to reach NGOs.
- NGOs and volunteers lack visibility into nearby surplus.
- Hotels have little incentive to change behaviour; a star rating gives them nothing.

## 3. Goals (MVP)

1. A hotel can post surplus in under 30 seconds.
2. An NGO can discover, claim and collect surplus with live map tracking.
3. NGOs report what they actually received; this is the platform's source of truth.
4. A fair, hard-to-game **Rescue Score** and public leaderboard motivate hotels.
5. A public news section builds emotional connection and audience.

## 4. Non-goals (MVP)

- Native iOS/Android apps
- Payments, delivery fees or marketplace pricing
- Hotel-side daily logs or in-app dispute handling (complaints go by email)
- Automated route optimisation across multiple pickups
- Independent (non-NGO) volunteers *(see Open Questions)*
- Raw/uncooked food, packaged retail goods

## 5. Users & Personas

| Role | Who | Main need |
|---|---|---|
| **Hotel / Donor** | Kitchen manager, banquet manager, hostel warden | Post surplus fast; get recognition and an impact report |
| **NGO Coordinator** | Runs shelter, orphanage, community kitchen | See nearby surplus, claim, manage collectors |
| **Volunteer / Collector** | NGO staff or driver | Navigate, collect, confirm handoff on a phone |
| **Public User** | Citizen with login | Read news, follow and cheer hotels, see leaderboard |
| **Admin** | Platform team | Approve orgs, review flagged reports, curate news |

## 6. Design Principles

1. **Minimum effort for hotels.** After posting a listing, hotels do nothing else in the app.
2. **NGO is the source of truth** for quantities and quality.
3. **Simple over flexible.** No configurable workflows in MVP.
4. **Admin-controlled fairness.** Disputes resolved by email → admin voids/corrects.

## 7. Functional Requirements

### 7.1 Accounts & Verification
- FR-A1: Sign up/login via email + password, or phone OTP *(see Open Questions)*.
- FR-A2: Roles: hotel, ngo, volunteer, public, admin.
- FR-A3: Hotels and NGOs register with profile data and documents; status is *pending* until an admin approves.
- FR-A4: Hotel profile captures one-time size data: venue type, rooms, seats, banquet capacity, events/month, operating days/week (used for the score benchmark).
- FR-A5: Public users can sign up instantly.

### 7.2 Listings (Hotel)
- FR-L1: Create a listing: title, diet (veg/non-veg/mixed), portions, cooked-at time, pickup-by time, packaging notes.
- FR-L2: Saved templates and "repost last listing" to cut effort.
- FR-L3: Listing auto-expires at pickup-by time if unclaimed.
- FR-L4: Hotel can cancel an unclaimed listing. A claimed listing can only be cancelled by an admin.
- FR-L5: Hotel sees status of its listings (read-only after posting).

### 7.3 Discovery & Claim (NGO)
- FR-C1: Map and list of nearby open listings, colour-coded by time left.
- FR-C2: Filters: distance, diet, minimum portions, time left.
- FR-C3: One-tap claim. Claim is atomic; first NGO wins.
- FR-C4: NGO assigns a volunteer (or claims for themselves).
- FR-C5: NGO may release a claim; listing reopens and nearby NGOs are re-notified.
- FR-C6: If a listing is unclaimed after a set time, notification radius expands.

### 7.3b Food-safety rules
- FR-S1: Only cooked or sealed food accepted; donor must tick a short safety checklist when posting.
- FR-S2: Show "consume within X hours" derived from cooked-at time.
- FR-S3: Terms of use accepted at sign-up (liability wording to be reviewed by a lawyer).

### 7.4 Pickup & Live Tracking
- FR-P1: Pickup statuses: Claimed → On the way → Collected → Completed.
- FR-P2: While *On the way*, the collector's phone shares location; hotel, NGO and admin see a moving marker, route line and ETA on the map.
- FR-P3: Tracking stops automatically at *Collected*.
- FR-P4: Handoff verification: collector must be within a geofence of the hotel and attach a photo.
- FR-P5: Public map view shows anonymised rescue activity (optional, see Open Questions).

### 7.5 Completion Report (NGO)
- FR-R1: After collection, the collector reports portions received (required), photo (required), quality tags, optional "portions left behind".
- FR-R2: Tags are from a fixed list (positive and issue tags).
- FR-R3: Reports not submitted within 4 hours trigger reminders, then an admin flag.

### 7.6 Rescue Score & Leaderboard
- FR-S4: Score computed from NGO-reported data only (see Section 8).
- FR-S5: Public leaderboard: top 10 per category, tiered badges (Seed, Sprout, Canopy, Forest), updated weekly.
- FR-S6: Hotels opt in to the public board; every hotel has a private read-only dashboard.
- FR-S7: Boards: Overall, Most Improved, Longest Streak. Ranked per venue category.

### 7.7 Impact Passport (Hotel incentives)
- FR-I1: Auto-generated monthly PDF certificate/report (meals rescued, NGOs served, estimated CO₂ avoided).
- FR-I2: Embeddable live badge for the hotel's website.
- FR-I3: Read-only dashboard: score, tier, meals rescued, trend.
- FR-I4: Guest-facing QR card linking to the hotel's public impact page.

### 7.8 News & Public Engagement
- FR-N1: News feed with internal stories, rescue milestones and external headlines (link-out, no copied text).
- FR-N2: City/area counter of meals rescued.
- FR-N3: Public users can follow hotels and send positive-only "kudos".
- FR-N4: No open comments.
- FR-N5: Admin can create, edit, hide and pin news items; RSS ingestion with admin approval.

### 7.9 Admin
- FR-D1: Approve/reject/suspend hotels and NGOs.
- FR-D2: Review queue of flagged reports (outliers, missing photos, mismatches).
- FR-D3: Void or correct a report with a reason; score recalculates; audit trail kept.
- FR-D4: Manage score weights, benchmark constants and tag lists.
- FR-D5: Curate news and view platform metrics.

### 7.10 Notifications
- FR-NT1: Web push (and in-app) for: new nearby listing, claim confirmed, collector on the way, collected, report due, tier change.
- FR-NT2: Email for approvals, certificates and complaint replies.

## 8. Rescue Score Specification (initial, tunable)

Computed over a rolling 60-day window from NGO-confirmed pickups.

| Signal | Definition | Weight |
|---|---|---|
| Rescue Rate | confirmed portions received ÷ expected portions (benchmark from hotel profile), capped at 100% | 40% |
| Participation | days with ≥1 completed pickup ÷ operating days | 20% |
| Listing Accuracy | 1 − average of \|listed − received\| ÷ listed | 15% |
| Handoff Quality | positive tags ÷ (positive + issue tags), per-NGO weight capped | 15% |
| Left-behind | 1 − left_behind ÷ (received + left_behind); optional, weight redistributed if missing | 10% |

- **Smoothing:** adjusted = (value × n + platform mean × k) ÷ (n + k), n = completed pickups, k = 5 (tunable).
- **Eligibility:** minimum 5 completed pickups in the window to appear on the public board.
- **Per-NGO cap:** one NGO can contribute at most 40% of the quality-tag weight for a hotel.
- **Benchmark:** expected portions per period derived from rooms, seats, banquet capacity and events/month using admin-set constants (calibrated in the pilot).
- Label this "Rescue Score"; disclose that it is benchmarked, not an exact percentage of all leftovers.

## 9. Non-Functional Requirements

- Mobile-first responsive UI; works on current Chrome, Safari, Edge, Firefox.
- Posting a listing ≤ 30 seconds; claiming ≤ 3 taps.
- Map location updates every 5–10 s during active pickups; ≤ 5 s end-to-end latency.
- HTTPS only; role-based access; photos stored privately.
- Location data used only during active pickups; pings deleted after 30 days.
- Accessible: large touch targets, readable contrast, simple language.

## 10. Success Metrics

| Metric | Pilot target (to calibrate) |
|---|---|
| Meals rescued per week | Baseline then +X% |
| Claim rate (listings picked up) | ≥ 70% |
| Time from post to claim | ≤ 20 min median |
| Hotel repeat posting | ≥ 60% of hotels post weekly after week 2 |
| Report completion within 4 h | ≥ 90% |
| Complaints per 100 reports | < 3 |
| Public weekly active users | Track growth |

## 11. Launch Criteria for Pilot

- 3–5 hotels and 2–3 NGOs onboarded and verified.
- End-to-end flow tested on iOS Safari and Android Chrome.
- Terms of use and food-safety checklist reviewed.
- Support email and admin review process in place.

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hotels don't post | Keep posting under 30 s; impact certificate and badge; early hands-on onboarding |
| NGO over-reporting or favouritism | Photo proof, outlier flags, NGO trust score, per-NGO cap, spot checks |
| Unfair low score for hotel | Smoothing, rolling window, weekly update, email → admin void |
| Background location limits on phones | Track only during pickups; wake lock; status updates as fallback |
| Food-safety incident | Checklist, time limits, audit trail, terms of use, legal review |
| Hotels reluctant to join a public board | Opt-in public listing; private dashboard for everyone |

## 13. Assumptions

- Volunteers belong to an NGO in the MVP.
- Quantities are counted in portions, not kg.
- Hotel complaints are handled by email, outside the app.
- Starting score weights and benchmark constants are guesses to be tuned.

## 14. Open Questions

See the questions list delivered with this document set (languages, auth method, volunteers, public live map, product name, geography, news sources, legal).
