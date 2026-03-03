# DESIGN SPECIFICATION

## ARCHITECTURE OVERVIEW
NewWallpaperWhoDis is built as a full-stack Next.js application, optimized for low-spec resources and packaged as a Docker container. It serves a dual purpose: a management Web UI and a static asset server for wallpapers.

## CORE COMPONENTS
### 1. Web UI (Next.js Frontend)
* **Dashboard:** Visual interface for managing images, profiles, and slugs. Features a disk space progress bar.
* **Aesthetics:** Incorporates an interactive particle background element heavily influenced by `vercel.com/fluid`.
* **Upload Manager:** Handles single and batch uploads, with basic name-based duplicate collision detection.

### 2. Asset Server (Next.js API Routes / App Router)
* **Dynamic Slugs:** Catches requests to user-defined slugs and returns the appropriate image based on the active profile's state.
* **Rotation Engine:** Evaluates triggers (time-based, request-based, random) to determine which image should be served for a given slug. For time-based rotations, synchronizes time from the web using a user-selected time zone.

### 3. Data Integrity & Storage
* **File System Configuration:** Stores images locally within the Docker container's mapped `/wallpapers` volume.
* **Metadata Store:** Uses a lightweight JSON-based local database (`data/db.json`) to persist profile configurations, slug mappings, and image metadata.
  * **Tags:** On upload, images are automatically tagged with buckets like "Orientation: Landscape" and "Aspect Ratio: 16:9" (using a ±5% mathematical tolerance).
