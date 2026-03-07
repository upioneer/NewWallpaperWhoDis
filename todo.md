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
* [ ] **User-Generated Collections:** Allow users to manually curate custom groups of images from the Gallery to assign as explicit filters for their rotational profiles.
* [ ] Image analytics and color extraction.
* [ ] Advanced duplication check diff UI.
* [ ] **Network Auto-Discovery:** Review `os.networkInterfaces()` implementation as it captures internal Docker container IPs rather than the host machine's LAN IP when containerized. Need a workaround for port-mapped instances.
* [x] **Marketing Website:** Scaffold and deploy a public-facing React/Vite page replicating the `readme.md` capabilities, hosted securely on Firebase.

## DISPLAY KIOSKS (v0.5)
* [x] Settings Configuration grid for HUD widgets.
* [x] Cinematic Web Player (`/display/[slug]`)
* [x] Organic "Dumb Terminal" Fallbacks for non-JS legacy devices.
