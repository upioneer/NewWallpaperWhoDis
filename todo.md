# PROJECT BACKLOG (TODO)

## PRIORITY: ARCHITECTURE & SETUP
* [x] Initialize Next.js project.
* [x] Set up basic UI shell and integrate particle background (Vercel fluid style).
* [x] Create Dockerfile and docker-compose setup.

## PRIORITY: BACKEND & DATA
* [x] Set up local file storage handler in Next.js API.
* [x] Create simple database schema (SQLite or lightweight equivalent) for profiles and image metadata.
* [x] Implement basic duplicate file name check on upload dropzone.
* [x] Implement categorization logic (extract dimensions from uploaded images).

## PRIORITY: CORE LOGIC
* [x] Implement slug routing (serve image binary depending on active profile state).
* [x] Implement timezone selection and web-synced time logic.
* [x] Implement the rotation rules engine (request, time, random).

## POST-MVP
* [x] **User-Generated Collections:** Allow users to manually curate custom groups of images from the Gallery to assign as explicit filters for their rotational profiles.
* [ ] **Robust Collections Ecosystem:** Expand the existing collections feature (e.g., smart/dynamic collections based on tags or dimensions, shared collections, bulk management). *Note: Must safely integrate into the UI without adding a 5th card to the main 4-pack dashboard grid.*
* [ ] Image analytics and color extraction.
* [ ] Advanced duplication check diff UI.
* [x] **Network Auto-Discovery & Pairing:** 
  * [ ] Implement mDNS/Bonjour for local `.local` hostname resolution.
  * [x] Add a "Pair Device" QR Code modal to the Profiles page for seamless mobile/TV scanning.
  * [x] Clarify the confusing "Raw Image" and "Display Kiosk" nomenclature on the Profile buttons.
* [x] **Container Outdated Notifications:** Implemented a silent GitHub API polling hook on the front-end dashboard that triggers an unobtrusive "Update Available" toast if the local `package.json` drifts behind the remote release tags.
* [x] **Marketing Website:** Scaffold and deploy a public-facing React/Vite page replicating the `readme.md` capabilities, hosted securely on Firebase.
* [ ] **Wasm/PWA Live Demo:** Enable a completely client-side version of the rotation engine utilizing the File System Access API and WebAssembly (Wasm) for image processing, allowing visitors to test the dashboard directly on the marketing website without a server.

## DISPLAY KIOSKS (v0.5)
* [x] Settings Configuration grid for HUD widgets.
* [x] Cinematic Web Player (`/display/[slug]`)
* [x] Organic "Dumb Terminal" Fallbacks for non-JS legacy devices.
