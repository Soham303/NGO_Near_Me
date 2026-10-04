# App Flow Document

**Version:** 0.1 (draft). Describes how each role moves through the app, plus state machines, notifications and edge cases.

---

## 1. Roles and Entry Points

| Role | Lands on after login |
|---|---|
| Hotel | "Post surplus" screen + own listings |
| NGO coordinator | Map of nearby open listings |
| Volunteer | My active pickup (or assigned pickups) |
| Public user | News feed + leaderboard |
| Admin | Admin dashboard |
| Logged-out visitor | Public home: city counter, top leaderboard, news teaser, sign-up |

## 2. Onboarding Flows

### 2.1 Hotel
1. Sign up → choose "Hotel / Restaurant / Event venue".
2. Enter details: name, venue type, address (map pin), contact, rooms, seats, banquet capacity, events per month, operating days per week.
3. Upload verification document (e.g., licence).
4. Accept terms and food-safety guidelines.
5. Status = **Pending** → admin approves → email + in-app notice → **Approved**.
6. First-run tip: "Post your first surplus in 30 seconds."

### 2.2 NGO
1. Sign up → choose "NGO".
2. Enter organisation name, registration number, address (map pin), capacity (portions per day), service radius.
3. Upload registration proof.
4. Add volunteers (name, phone) after approval.
5. Pending → admin approval → Approved.

### 2.3 Volunteer
1. NGO coordinator adds the volunteer; volunteer receives an invite link, sets a password or verifies via OTP.
2. First-run: grant location and camera permission; short explanation of why.

### 2.4 Public user
1. Sign up with email or phone → lands on news feed. No approval needed.

## 3. Core Flow: Surplus Listing to Completed Pickup

```
 Hotel posts listing ──▶ NGOs notified (nearby)
        │                       │
        │                NGO claims (atomic)
        │                       │
        │               Volunteer assigned
        │                       │
        │            "On the way" (live tracking starts)
        │                       │
        │          Arrives, collects, photo + geofence check
        │                       │
        │             "Collected" (tracking stops)
        │                       │
        └──────────────▶ Volunteer submits report
                      (portions, photo, tags, left-behind?)
                                │
                        Score updated (weekly snapshot)
```

### 3.1 Hotel: Post a listing
1. Tap **Post surplus**.
2. Fill: title, diet, portions, cooked-at (default now), pickup-by (default +2 h), packaging notes.
3. Tick food-safety checklist.
4. Submit → listing status **Posted**; nearby NGOs notified.
5. Hotel sees a read-only status card (Posted → Claimed → On the way → Collected → Completed) and the live map once tracking starts.
6. Shortcuts: "Repost last" and saved templates.

### 3.2 NGO: Discover and claim
1. Notification or open map; pins coloured by time left.
2. Tap a pin → card: food, portions, diet, distance, time left, hotel name.
3. Tap **Claim** → confirm.
   - Success: listing locked to this NGO.
   - Failure ("already claimed"): friendly message, return to map.
4. Choose collector (default: self or a saved volunteer).
5. Volunteer receives the assignment notification.

### 3.3 Volunteer: Collect
1. Open assigned pickup → see address, contact, pickup-by time.
2. Tap **Start trip** → status **On the way**; location sharing begins; wake-lock prompt shown.
3. Map shows route and ETA; hotel and NGO see the moving marker.
4. On arrival, tap **I've arrived** (optional) and then **Collected**.
   - System checks geofence; if outside range, show a warning and continue with a flag.
5. Status **Collected**; tracking stops.

### 3.4 Volunteer: Completion report
1. Prompt appears immediately after Collected.
2. Enter portions received (required), take photo (required).
3. Select tags: positive (Ready on time, Well packaged, Fresh) and/or issue (Late, Quantity short, Poor packaging).
4. Optional: portions left behind.
5. Submit → status **Completed**; hotel and NGO notified.
6. If not submitted within 4 hours: reminders at 1 h and 3 h; then auto-flag for admin.

## 4. State Machines

### Listing
`posted → claimed → completed`
`posted → expired` (pickup-by passed, unclaimed)
`posted → cancelled` (hotel cancels, or admin)
`claimed → posted` (NGO releases the claim and the listing is reopened)

### Pickup
`claimed → on_the_way → collected → completed`
`claimed / on_the_way → cancelled` (NGO releases, volunteer cannot make it)

## 5. Public User Flows

1. **News:** open feed → read internal stories, rescue milestones, external headlines (link out).
2. **Leaderboard:** open board → choose category → see top 10, tiers, "Most Improved", "Longest Streak".
3. **Hotel page:** tap a hotel → public impact page (meals rescued, tier, history). Actions: **Follow**, **Send kudos** (positive only; limited to once per hotel per week).
4. **Notifications:** followed hotel reaches a milestone or tier.
5. **Share:** share the city counter or a hotel's badge.

## 6. Admin Flows

1. **Approvals queue:** review documents → approve, reject (with reason), or suspend.
2. **Flag queue:** auto-flagged reports (large mismatch vs listed quantity, missing/duplicate photo, outside geofence, late report, outlier NGO). Open a report → see photo, quantities, tags, NGO history → **Keep**, **Correct**, or **Void** (reason required). Score recalculates; audit entry saved.
3. **Complaint handling (off-app):** hotel emails support → admin finds the pickup → reviews evidence → keep/correct/void → replies by email.
4. **News:** approve RSS items, write stories, pin items, hide items.
5. **Settings:** score weights, benchmark constants, tag lists, notification radius rules.
6. **Weekly leaderboard publish:** snapshot computed, admin glances at anomalies, then it goes live automatically.

## 7. Notification Triggers

| Event | Recipient | Channel |
|---|---|---|
| New listing within NGO radius | NGOs nearby | Push + in-app |
| Listing unclaimed after N min | Wider-radius NGOs | Push + in-app |
| Claim confirmed | Hotel | Push + in-app |
| Volunteer assigned | Volunteer | Push + in-app |
| Volunteer on the way | Hotel | Push + in-app |
| Collected | Hotel, NGO | In-app |
| Report due | Volunteer | Push + in-app |
| Report flagged / voided | NGO | In-app + email |
| Approval decision | Hotel / NGO | Email + in-app |
| Monthly certificate ready | Hotel | Email + in-app |
| Tier change / milestone | Hotel, followers | In-app |

## 8. Edge Cases

| Case | Handling |
|---|---|
| Two NGOs claim at once | Atomic claim; loser sees "already claimed" |
| Nobody claims | Expand radius after N minutes; expire at pickup-by time |
| NGO claims and doesn't show | Auto-release if no "On the way" by claim deadline; reduces NGO reliability score; listing reopens |
| Volunteer's location lost | Show last known position + "updated X min ago"; flow continues by manual statuses |
| Volunteer denies location permission | Block "On the way" tracking with an explanation; allow manual statuses and flag |
| Food expires while in transit | Warn at 15 min before pickup-by; allow completion with an issue tag |
| Reported quantity far from listed | Auto-flag to admin queue |
| Hotel disputes a score | Email → admin review → void/correct |
| Photo upload fails | Retry with local queue; report saved as draft |
| Hotel has no internet | Listing form saves draft locally and submits when online |
| NGO account suspended mid-pickup | Pickup frozen; admin reviews |
| Duplicate listing spam | Rate limit per hotel; warn on near-identical repeat within 10 minutes |

## 9. Navigation Map (summary)

- **Hotel:** Post · My listings · Impact (score, certificate, badge) · Profile
- **NGO:** Map · Active pickups · Volunteers · History · Profile
- **Volunteer:** Active pickup · History
- **Public:** News · Leaderboard · Following · Profile
- **Admin:** Approvals · Flags · News · Settings · Metrics
