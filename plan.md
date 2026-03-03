# PROJECT ROADMAP

## PHASE 1: THE FOUNDATION (MVP)
* [x] Scaffold Next.js project and layout basic Docker configuration.
* [x] Implement fluid particle background and global UI layout.
* [x] Develop image upload functionality with basic duplicate name checking.
* [x] Implement image processing to automatically categorize minimum dimensions.
  * *Logic:* Categorizes Orientation (Portrait, Landscape, Square, Panoramic) and Aspect Ratio (16:9, 16:10, 4:3, 21:9, Mobile, Custom) within a ±5% tolerance bucket.
* [x] Build Profile/Slug management UI.
* [x] Implement the rotation engine (Time-based, Request-based, Random triggers) and web time synchronization.
* [x] Create dynamic API routes to serve images based on slugs.
* [x] Add disk space progress bar to the dashboard.

## PHASE 2: ADVANCED FEATURES (POST-MVP)
* [x] **Light/Dark Tagging:** Track 'Light' and 'Dark' luminosity by analyzing the average RGB brightness of the images.
* [x] **Gallery Sorting & Tooltips:** Added sorting controls (Newest, Oldest, A>Z, Z>A) and filename hover-tooltips to the UI grid.
* [x] **Global System Stability:** Patched JS scoping issue `settings is not defined` preventing conditional interactive background rendering.
* [x] **UI Consistency:** Exposed the System Settings route cog globally across `Gallery` and `Profile` headers.
* [x] **Dual Storage Tracking:** Implemented an `/api/sysinfo` disk check overlaying total system capacity against the absolute footprint of the application's `wallpapers` payload in real-time.
* [ ] **Image Analytics & Tagging:** Process images to extract color palettes/dominant colors, and allow users to manually add, edit, or override tags.
* [ ] **Advanced Smart Uploads:** Compare file sizes, dimensions, and modification dates for duplicate collision detection, with a visual diff UI for users.

## PHASE 3: ASSETS & HARD SYNCING
* [x] **Ghost Image Reconciliation:** Implement Two-Way Sync so deleting a physical file purges the database record. Add a "Hard Refresh" button to the Gallery for ad-hoc user forcing.
* [x] **Asset Licensing:** Crediting the Unsplash default assets properly in a new `LICENSE-ASSETS.md` file.
* [x] **Testing Specifications:** Populate `testing.md` with explicit Manual UI validation logic.
* [ ] **Testing Execution:** Walk through `testing.md` and verify all conditions.
