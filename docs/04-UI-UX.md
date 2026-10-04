# UI / UX Document

**Version:** 0.1 (draft). Visual values are starting suggestions, not fixed brand decisions.

---

## 1. Design Principles

1. **Speed first.** Hotel posting in under 30 seconds; NGO claim in 3 taps.
2. **Phone first.** Used one-handed, in kitchens and on the road. Desktop gets the same app with more room.
3. **Plain language.** Short labels, no jargon, large readable text.
4. **Clear urgency.** Time left is always visible and colour-coded.
5. **Warm and hopeful.** Dignity-first imagery; avoid guilt or poverty clichés.
6. **Low friction for everyone.** Defaults everywhere (times, last-used values).

## 2. Brand Direction (suggestion)

- **Feel:** fresh, trustworthy, human.
- **Colours (tokens):**
  - Primary green `#2E7D32` (action), light green `#E8F5E9` (surfaces)
  - Warm accent orange `#F57C00` (urgency, highlights)
  - Urgency scale: green `#2E7D32` (> 2 h), amber `#F9A825` (1–2 h), red `#C62828` (< 1 h)
  - Neutrals: text `#1F2933`, muted `#667085`, border `#E4E7EC`, background `#FAFAF7`
- **Typography:** one clean sans-serif (e.g., Inter or similar). Body 16 px minimum; headings 20–28 px.
- **Shape:** rounded corners (12 px cards, 999 px pills), soft shadows.
- **Dark mode:** optional later; define colours as tokens now to make it easy.

## 3. Layout & Responsiveness

| Breakpoint | Layout |
|---|---|
| < 640 px (phone) | Single column, bottom tab bar, full-screen map sheets |
| 640–1024 px (tablet) | Two columns where useful |
| > 1024 px (desktop) | Left sidebar navigation, map + list split view |

- Touch targets ≥ 48 px.
- Primary action fixed at the bottom of the screen on phones.
- Safe-area padding for notched phones.

## 4. Key Components

- **Listing card:** food title, portions, diet icon, distance, countdown pill (colour-coded), hotel name, Claim button.
- **Countdown pill:** "1h 20m left" with urgency colour.
- **Status timeline:** horizontal stepper (Posted → Claimed → On the way → Collected → Completed) with timestamps.
- **Map marker set:** listing pins (urgency colours), NGO icon, volunteer marker (animated), hotel marker.
- **Bottom sheet:** listing details and pickup panel that slide over the map on mobile.
- **Tag chips:** positive (green outline) and issue (amber outline) selectable chips.
- **Tier badge:** Seed, Sprout, Canopy, Forest with simple plant icons.
- **Score ring:** circular progress showing Rescue Score.
- **Leaderboard row:** rank, hotel name, tier badge, score, small trend arrow.
- **News card:** image, headline, source, time, "Read" link; story cards for internal pieces.
- **Counter tile:** big number, label ("Meals rescued this month").
- **Toasts and banners:** success, error, offline.

## 5. Screen Inventory

### Public / Visitor
1. **Home:** hero with city counter, "Join as hotel / NGO / supporter", top 3 leaderboard, news teaser.
2. **Leaderboard:** category tabs, top 10, tiers, boards (Overall, Most Improved, Streak).
3. **Hotel public page:** logo, tier, meals rescued, history chart, Follow, Send kudos.
4. **News feed and article view.**
5. **Sign up / Login.**

### Hotel
6. **Post surplus (home):** big form with defaults, templates, safety checklist, **Post** button.
7. **My listings:** list with status chips; tap for detail and live map.
8. **Listing detail with live map:** timeline, map, volunteer ETA (read-only).
9. **Impact:** score ring, tier, meals rescued, trend, certificate downloads, badge embed code, QR card download.
10. **Profile:** venue info, public-listing toggle, support email link.

### NGO Coordinator
11. **Map & list:** toggle view; filters (distance, diet, portions, time left).
12. **Listing sheet:** details + **Claim**.
13. **Assign volunteer sheet.**
14. **Active pickups:** cards with status and ETA.
15. **Volunteers:** list, add/invite, activate/deactivate.
16. **History:** past pickups with reports.

### Volunteer
17. **Active pickup:** big address, directions, **Start trip** / **I've collected** buttons, wake-lock hint.
18. **Live trip screen:** map with route, ETA, status button.
19. **Completion report:** portions input (number stepper), camera button, tag chips, optional left-behind, **Submit**.

### Public User
20. **News + Following feed.**
21. **Hotel page actions:** Follow, Kudos.

### Admin
22. **Approvals queue.**
23. **Flag queue** with side-by-side evidence (photo, quantities, tags, history) and Keep / Correct / Void actions.
24. **News manager.**
25. **Settings** (weights, constants, tags).
26. **Metrics dashboard.**

## 6. Map UX Spec

- Default view: user's location, zoom to show nearest listings.
- Pins coloured by time left; pulsing ring for red.
- Tap pin → bottom sheet (mobile) or side panel (desktop).
- Active pickup: route line (dashed grey), moving marker (green with direction), ETA chip, "updated 8 s ago" label.
- If location is stale > 2 minutes: marker turns grey with "last seen" note.
- Attribution to OpenStreetMap shown in the corner.
- Large "Recentre" button; no clutter.

## 7. Key Interaction Details

- **Posting:** the form remembers last values; cooked-at defaults to now; pickup-by defaults to +2 h; portions use a number stepper with quick chips (10, 25, 50, 100).
- **Claiming:** a confirmation sheet, not a full page; success shows a clear green banner and next step.
- **Report:** after "Collected", the report screen opens automatically so nothing is forgotten.
- **Leaderboard:** top performers prominently; bottom ranks never publicly shown.
- **Kudos:** one tap with a small animation; limited to once per hotel per week.

## 8. Empty, Loading and Error States

| State | Message style |
|---|---|
| No listings nearby | "Nothing nearby right now. We'll notify you when food is posted." |
| No pickups yet (hotel) | "Post your first surplus. It takes 30 seconds." |
| Claim lost | "Another NGO claimed this a moment ago. Here are other nearby listings." |
| Location denied | Explain why location is needed and how to enable it |
| Offline | Banner: "You're offline. We'll sync when you're back." |
| Upload failed | "Photo couldn't upload. We'll retry automatically." |

Use skeleton loaders for lists and cards.

## 9. Accessibility

- WCAG AA contrast; never rely on colour alone (urgency also shown by text and icon).
- Labels on every form field; correct focus order; visible focus states.
- Support text scaling up to 200%.
- Screen-reader labels for map controls and status changes.
- Simple language; consider translations (see Open Questions).

## 10. Content & Tone

- Friendly, direct: "Thanks, 40 meals on their way."
- News and stories: respect for recipients, no pity imagery, consent for photos.
- Avoid shaming language on the leaderboard; celebrate progress ("Climbing: +3 places").

## 11. Public Pages and Sharing

- Hotel public page and badge are mobile-optimised and shareable (Open Graph previews).
- Printable QR card for hotel guests ("Your stay helped feed X people").

## 12. Deliverables to Produce Next

- Low-fidelity wireframes for screens 1, 6, 11, 17–19, 23.
- Clickable prototype (Figma or coded) of the core flow.
- Component library in code with the tokens above.
