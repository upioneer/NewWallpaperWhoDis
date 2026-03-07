# TESTING SPECIFICATION

## CORE PHILOSOPHY
Since this project utilizes a Flat File Architecture and relies entirely on physical filesystem operations, our testing strategy prioritizes end-to-end Manual UI Verification and API validation over abstracted unit testing. We want to ensure that user inputs reliably manipulate the local disk cache without data loss.

---

## PHASE 1 TESTS: CORE INFRASTRUCTURE

### T1.1: Background Ingestion Crawler
* **Condition**: Drop a new valid image (e.g., `.png`) and an invalid document (e.g., `.pdf`) into the `/wallpapers` folder via the host OS. Navigate to the Gallery page.
* **Expected**: The `.png` image should instantly appear in the Gallery. The `.pdf` document should be aggressively purged from the host OS folder to prevent bloat.

### T1.2: Database Cache Resilience
* **Condition**: Stop the Next.js server. Delete the `/data/db.json` file completely. Restart the server and load the homepage.
* **Expected**: The app should not crash. A blank `db.json` skeleton should be auto-created. The background crawler should immediately rescan the `/wallpapers` folder and retroactively populate all missing dimensions, orientation tags, and luminosity buckets.

---

## PHASE 2 TESTS: UI & FILTERING

### T2.1: Advanced Gallery Filtering
* **Condition**: Upload a mix of Light and Dark images, in both Landscape and Portrait orientations. Use the Gallery dropdowns to filter for "Landscape" and "Light".
* **Expected**: The Gallery grid should strictly show ONLY images that match both criteria simultaneously. The item count pill should reflect the exact number.

### T2.2: Hard Sync UI Reconciliation
* **Condition**: Note the number of images in the DB. Manually delete an image file directly from the host OS `/wallpapers` folder (creating a "ghost" database record). Click the "Force Sync" icon in the Gallery header.
* **Expected**: The syncing icon should spin briefly. The ghost image should immediately disppear from the Gallery UI grid, and its record should be silently purged from `/data/db.json`.

### T2.3: User-Generated Collections Integration
* **Condition**: Select 3 images in the Gallery using the new "Create Collection" workflow. Name it "My Favorites". Create a Profile and select "My Favorites" as the collection filter.
* **Expected**: The new Collection should save successfully in the DB, appear in the dropdown during profile creation, and accurately constrain the endpoint's served images to only those 3 selected specific files.

---

## PHASE 3 TESTS: PROFILE ENGINE

### T3.1: Profile Category Scoping
* **Condition**: Create a new profile named "Night Shift". Set the filters to `Orientation: Ultra-Wide` and `Luminosity: Dark`. Set the rotation rule to `Fixed Time: 60 minutes`. Save the profile.
* **Expected**: The profile should appear in the Profile List.

### T3.2: Dynamic Endpoint Validation
* **Condition**: Navigate to `http://localhost:6767/[slug-name]` using the slug from T3.1. Refresh the page 5 times.
* **Expected**: The browser should only ever render images that are both `Ultra-Wide` and `Dark`. Since the rotation is `Fixed Time: 60 minutes`, refreshing the page should consistently return the exact same image until 60 real-world minutes have passed.

---

## PHASE 4 TESTS: CI/CD & REGRESSION AVOIDANCE

### T4.1: Strict TypeScript Compilation (CI/CD Pipeline)
* **Condition**: Run `npx tsc --noEmit` locally before any GitHub deployment push. 
* **Expected**: The compiler must return absolutely zero errors. This isolates missing interfaces (like `collection?: string`) that prevent the Next.js `npm run build` worker from succeeding in automated environments, despite running fine on local development servers.

### T4.2: Global Stylesheet & Layout Validation
* **Condition**: Open the application's top-level `src/app/layout.tsx`. Examine the import blocks.
* **Expected**: `import "./globals.css";` MUST be present at the top of the file. Without this single line, the entire Tailwind engine fails to parse, causing `fixed` canvases to revert to block elements and push all dashboard content below the viewport.

### T4.3: Real-Time Theme Listener Reactivity
* **Condition**: Set up a custom EventListener (`window.addEventListener('theme-changed', ...)`). Navigate to Settings and quickly swap between CSS variable themes (Miami -> Northern Lights -> Dragon).
* **Expected**: The Canvas `requestAnimationFrame` loop should dynamically extract and map the new `--primary` hex property in real-time, instantly shifting stroke and fill paints without requiring a hard window refresh. This prevents "ReferenceError: settings is not defined" scoping bugs during hydration.

---

## PHASE 5 TESTS: DISPLAY KIOSK (v0.5)

### T5.1: Dumb Terminal HTML Fallback
* **Condition**: Create a "60 second" rotation profile. In Google Chrome, open Dev Tools, hit `Ctrl+Shift+P`, type `Disable JavaScript` and press enter. Navigate to the profile's Kiosk UI at `/display/myslug`. Do NOT touch the keyboard.
* **Expected**: Even though JS is dead, the raw HTML DOM should contain `<meta http-equiv="refresh" content="60">`. Exactly 60 seconds later, Chrome will physically reload the page resulting in the next chronological image.

### T5.2: Cinematic JS Interception
* **Condition**: Re-enable JavaScript. Give the profile a "Ken Burns" transition in Settings. Navigate to `/display/myslug`. Open the network tab.
* **Expected**: The `<meta>` tag is actively deleted from the DOM by React. The screen will flawlessly overlay and pan the image smoothly utilizing GPU CSS constraints. Natively, the browser will execute a silent XHR request to `/api/display/[slug]` every 8 seconds, awaiting a new Image ID from the backend to initiate the graphical swap natively without ever flashing a white loading screen.
