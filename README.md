# Vietnam Explorer — Travel & Food (PWA + admin)

Discover beautiful places and good food around Vietnam: a photo-first Progressive Web App with a map,
plus an admin page to add and edit places and food reviews.

```
web/        React + Vite PWA (public site at /, admin at /admin)        → Vercel
backend/    Spring Boot 3 API (Java 17, Postgres, JWT admin, uploads)   → k8s on 192.168.1.100
k8s/        Kubernetes manifests, synced by ArgoCD (app "vietnam-explorer")
.github/    CI: test → build image → push ghcr.io → pin tag in k8s/ → ArgoCD rolls out
```

Request path: **browser (Vercel site)** → `https://<ngrok-domain>/vietnam-explorer/api/…` → host nginx →
NodePort **30885** → backend → Postgres. API calls send `ngrok-skip-browser-warning`; uploaded photos
are fetched the same way and shown from blob URLs (a plain `<img>` would get ngrok's warning page).

## Features

- **Travel** (28 places) and **Food** (28 dish reviews) with real photos from Wikimedia Commons
  (author + licence shown on each place), a map with pins, Google Maps / Directions buttons.
- Accent-insensitive search ("da lat" → Đà Lạt), filters by region, type and favourites.
- Personal notes, stars, favourites and "been there", saved on the device.
- Vietnamese / English, installable, works offline (last loaded data, cached photos).
- **Admin** (`/admin`): log in, add / edit / hide / delete places and reviews, pick the location on a
  map (or paste coordinates from Google Maps), upload photos (resized in the browser before upload).
- If the server is unreachable, the site falls back to the last saved data or the built-in seed.

## Local development

```bash
# API (H2 file database in backend/data, no Postgres needed); seeds the 56 places on first start
cd backend
APP_ADMIN_PASSWORD=choose-one APP_JWT_SECRET=dev-secret ./mvnw spring-boot:run     # :8085
./mvnw test

# Web, pointed at the local API
cd web
npm install
VITE_API_URL=http://localhost:8085/api npm run dev    # :5173, admin at /admin (user "admin")
npm test
```

Without `VITE_API_URL` the site runs from the built-in seed data only (no admin).

## Deployment

### Backend (k8s, GitOps)
Push to `main` with changes in `backend/` → GitHub Actions runs the tests, pushes
`ghcr.io/trantheanh135/vietnam-explorer-backend:<sha>`, commits the new tag to `k8s/03-backend.yaml`,
and ArgoCD syncs it. One-time setup (already done):

```bash
K="kubectl --kubeconfig ~/.kube/config-192"
$K create namespace vietnam-explorer
$K -n vietnam-explorer create secret generic vietnam-explorer-secret \
  --from-literal=POSTGRES_PASSWORD=… --from-literal=APP_ADMIN_PASSWORD=… --from-literal=APP_JWT_SECRET=…
$K apply -f k8s/argocd-application.yaml
```

Host nginx (`/etc/nginx/sites-available/finance-tracker` on 192.168.1.100) routes
`/vietnam-explorer/api/` → `http://127.0.0.1:30885/api/`.

**Change the admin password:** update `APP_ADMIN_PASSWORD` in the secret, then
`$K -n vietnam-explorer rollout restart deploy/backend`.

### Web (Vercel)
`bash web/deploy-vercel.sh` (runs the tests first). Vercel project `vietnam-explorer` has the env var
`VITE_API_URL=https://<ngrok-domain>/vietnam-explorer/api`.

## Data model (one table, `place`)

`id` (slug) · `category` travel|food · `region` north|central|south · `nameEn` / `nameVi` (dish name for
food) · `venue`, `address` (food) · `area` (province / city) · `lat`, `lng` · `tags` (travel) ·
`descEn` / `descVi` · `tipEn` / `tipVi` (best time / must try) · `rating`, `price` (food) ·
`image` {src, page, author, license} · `published`.

Photos: only use photos you have the right to use; credit the author and licence in the form.
