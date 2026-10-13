# FoodRescue Platform - Spring Boot 3.3 Backend

Enterprise REST API backend for the **FoodRescue / NGO Near Me** surplus food rescue and redistribution ecosystem, converted from direct client-side Supabase operations into a high-performance Spring Boot service.

## 🚀 Key Features

- **Domain Architecture**: 18+ PostgreSQL JPA entities mirroring the production Supabase PostGIS schema.
- **Supabase Authentication & RBAC**: Stateless Spring Security filter verifying Supabase JWT tokens and role hierarchies (`HOTEL`, `NGO`, `VOLUNTEER`, `ADMIN`, `PUBLIC`).
- **Atomic Claim Engine**: Concurrency-safe listing reservation avoiding race conditions during volunteer claim flows.
- **Geospatial Proximity Queries**: Haversine distance calculations and PostGIS spatial indexing for finding nearby food donations within NGO service radii.
- **Live Dispatch & GPS Tracking**: Real-time breadcrumb tracking via location pings and ETA calculation.
- **Automated Moderation & Scoring**: Quality score snapshot computation (rescue rate, participation, listing accuracy, handoff quality) and auto-flagging on quantity discrepancies (>15%).
- **Dynamic SVG Badge Rendering**: High-performance SVG badge generation endpoint (`/api/badge/{slug}`) for embedding verified rescue ratings on external websites.

---

## 🛠 Technology Stack

- **Java**: Java 21 (LTS)
- **Framework**: Spring Boot 3.3.4
- **ORM / Persistence**: Spring Data JPA / Hibernate 6.5
- **Database**: PostgreSQL 15+ (PostGIS & pgcrypto enabled via Supabase)
- **Security**: Spring Security 6 with JJWT (0.12.6) for Supabase JWT verification
- **Build Tool**: Apache Maven 3.9+ (includes `mvnw` Maven Wrapper)

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` or configure `src/main/resources/application.yml`:

```properties
# Supabase PostgreSQL Database Connection
SPRING_DATASOURCE_URL=jdbc:postgresql://db.djcwmdkenwcmsbcaqknc.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your-supabase-db-password-here

# Supabase Platform Keys
SUPABASE_URL=https://djcwmdkenwcmsbcaqknc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here
```

---

## 📖 API Endpoints Reference

### 1. Authentication & Profile
- `GET /api/auth/profile` - Get current authenticated user profile & associated hotel/ngo/volunteer record
- `POST /api/auth/register-sync` - Synchronize/register profile and entity upon frontend signup
- `GET /api/auth/session` - Get current session context

### 2. Listings
- `GET /api/listings` - List all food donations (supports `?status=posted`)
- `GET /api/listings/nearby?lat={lat}&lng={lng}&radiusKm={km}` - Find listings within radius
- `GET /api/listings/{id}` - Get listing by ID
- `POST /api/listings` - Post a new surplus food listing
- `PATCH /api/listings/{id}/cancel` - Cancel a posted listing

### 3. Pickups & Tracking
- `GET /api/pickups` - List all pickups with enriched details
- `GET /api/pickups/{id}` - Get pickup details
- `POST /api/pickups/claim` - Atomically claim a listing
- `POST /api/pickups/{id}/release` - Release an uncompleted claim
- `POST /api/pickups/{id}/start-trip` - Mark dispatch `on_the_way`
- `POST /api/pickups/{id}/location` - Record GPS ping & update live coordinates
- `POST /api/pickups/{id}/handoff` - Record handoff & verify geofence
- `POST /api/pickups/{id}/complete` - Submit completion report with portions received & photo proof
- `POST /api/pickups/{id}/assign-volunteer` - Assign volunteer driver

### 4. Public Badges & Leaderboard
- `GET /api/badge/{slug}` - Generates dynamic SVG badge (content-type: `image/svg+xml`)
- `GET /api/scores/leaderboard` - Public hotel impact leaderboard
- `GET /api/scores/hotel/{hotelId}` - Historical score snapshots for venue

### 5. Organizations & Master Data
- `GET /api/hotels` - List registered hotels
- `GET /api/hotels/{id}` or `/api/hotels/slug/{slug}` - Hotel details
- `GET /api/ngos` - List verified NGOs
- `GET /api/volunteers` - List active volunteers
- `GET /api/tags` - List feedback tags

### 6. Moderation & Admin
- `GET /api/flags` - List moderation alerts
- `POST /api/flags/{id}/resolve?status={status}` - Resolve flag (`keep`, `correct`, `voided`)
- `GET /api/admin/actions` - Audit log
- `POST /api/admin/org/{type}/{id}/status?status={status}` - Approve/suspend organization

---

## 🏃 Building and Running

### Build JAR Package
```bash
./mvnw clean package -DskipTests
```

### Run Locally
```bash
./mvnw spring-boot:run
```
The server will start on `http://localhost:8080`.
