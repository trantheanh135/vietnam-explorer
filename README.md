# Vietnam Explorer — Travel & Food (PWA)

A Progressive Web App that shows beautiful places and good food around Vietnam on a map.

- **Two categories:** 🏝️ **Travel / Du lịch** (28 places: bays, mountains, heritage sites, islands, cities) and 🍜 **Food / Ẩm thực** (28 dish reviews with rating, price and a "must try" tip).
- **Google Maps:** an interactive Google map when an API key is configured (OpenStreetMap fallback without one), and **Open in Google Maps** / **Directions** buttons on every place.
- **Search without accents:** "da lat" finds Đà Lạt, "pho" finds Phở. Filter by North / Central / South, travel type and favourites.
- **Your own reviews:** star rating, favourite, "been there" and notes, saved on your device.
- **Vietnamese / English** toggle.
- **Installable and offline-capable:** add it to your phone's home screen. The list, details and your reviews work offline; the map needs internet.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (search, data integrity, links, reviews)
npm run build      # production build + service worker in dist/
npm run preview    # serve the production build (http://localhost:4173)
```

## Use Google Maps (API key)

Without a key, the app shows an OpenStreetMap map. To switch to Google Maps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project → **APIs & Services → Library** → enable **Maps JavaScript API**. Billing must be enabled on the project; Google offers a monthly free usage allowance.
2. **APIs & Services → Credentials → Create credentials → API key**.
3. **Restrict the key:** application restriction = *HTTP referrers*, for example `http://localhost:5173/*`, `http://localhost:4173/*` and `https://your-domain/*`. API restriction = *Maps JavaScript API*.
4. Create a file named `.env` in this folder:

   ```
   VITE_GOOGLE_MAPS_API_KEY=your-key-here
   # optional: a Map ID from Google Cloud → Map Management (custom styling)
   VITE_GOOGLE_MAP_ID=
   ```

5. Restart `npm run dev` (or rebuild). `.env` is git-ignored, so the key is never committed.

The key is visible in the browser (all client-side map keys are), which is why the referrer restriction in step 3 matters.

## Install on your phone

A PWA must be served over **HTTPS** (localhost is the only exception), so deploy it first (see below), then:

- **Android (Chrome):** open the site → tap **⬇ Install** in the header, or menu ⋮ → *Install app*.
- **iPhone (Safari):** open the site → Share → **Add to Home Screen**.

## Deploy

It is a static site; the build output is `dist/`.

- **Vercel:** import the folder/repo, framework preset *Vite*, build `npm run build`, output `dist`. Add `VITE_GOOGLE_MAPS_API_KEY` under *Environment Variables*, and add your Vercel domain to the key's referrer list.
- **Any static host / Nginx:** upload `dist/`, serve `index.html` for unknown paths, and don't cache `sw.js` for long (so updates reach users).

## Add or edit places

All content is in two plain files:

- `src/data/travel.js` — `name`, `nameVi`, `region` (`north` / `central` / `south`), `province`, `lat`, `lng`, `tags`, `desc.en/vi`, `bestTime.en/vi`
- `src/data/food.js` — `dish`, `dishVi`, `place`, `address`, `city`, `lat`, `lng`, `rating`, `price`, `desc.en/vi`, `mustTry.en/vi`

Get coordinates by right-clicking a spot in Google Maps (the first menu item copies `lat, lng`). Run `npm test` afterwards: it checks for duplicate ids, pins outside Vietnam and missing translations.

Notes on the content:
- Pins are approximate; the Google Maps buttons search by name + address, so Google finds the exact location.
- Food ratings are editorial opinions and prices are approximate. Restaurants change, so check opening hours on Google Maps before you go.
- Province names show the pre-2025 province with the merged province in brackets where it changed, e.g. *Hà Giang (Tuyên Quang)*.

## Project structure

```
src/
  App.jsx                    layout, tabs, filters, state
  components/
    MapView.jsx              chooses Google Maps or OpenStreetMap; error boundary
    GoogleMapView.jsx        @vis.gl/react-google-maps (AdvancedMarker, InfoWindow)
    LeafletMapView.jsx       react-leaflet fallback
    PlaceList.jsx            cards
    PlaceDetail.jsx          details, Google Maps links, "My review"
    Stars.jsx
  data/travel.js, food.js    content
  lib/places.js              search (accent-insensitive), filters, Google Maps URLs
  lib/reviews.js             personal reviews in localStorage
  i18n.js                    Vietnamese / English strings
vite.config.js               PWA manifest + service worker (vite-plugin-pwa / Workbox)
public/                      icons
```
