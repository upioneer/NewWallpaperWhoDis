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
* [ ] Image analytics and color extraction.
* [ ] Advanced duplication check diff UI.
