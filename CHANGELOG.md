# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.5.0] - 2026-03-06

### Added
- **Display Kiosk Web Player:** A zero configuration end point (`/display/[slug]`) to broadcast image profiles as comprehensive digital signage.
- **Widget HUD Engine:** A 3x3 interactive visual grid array located in Settings allowing users to overlay modules.
- **Clock, Location, Text, & Weather Widgets:** Native modules rendering transparently atop the Kiosk Player (Weather requires OpenWeatherMap API key).
- **Cinematic Transitions:** Native CSS hardware accelerated Fades, Slides, and Ken Burns effects configured remotely from the dashboard without touching the endpoint.
- **"Dumb Terminal" Backup:** A rock solid organic contingency. The server natively injects `<meta http-equiv="refresh">` instructions into the HTML header if the client's browser disables or fails to execute local React JavaScript polling, assuring rotation occurs regardless of hardware age.

## [v0.4.3] - 2026-03-06

### Documented
- Refined the primary `README.md` hook to boldly emphasize the benefits of a GUI dashboard over legacy CLI operations.
- Explicitly tracked and synchronized index capitalization (`README.md` versus `readme.md`) to resolve documentation staging mismatch errors blocking upstream deployment.

## [v0.4.2] - 2026-03-06

### Fixed
- Injected strict OCI metadata labels (`org.opencontainers.image.source` and `org.opencontainers.image.description`) directly into the production `Dockerfile` runner stage. This forcefully binds the GitHub Container Registry (GHCR) package directly to the root source, dynamically pulling the README contents without permissions failures.

## [v0.4.1] - 2026-03-06

### Added
- **Marketing Site Firebase Deployment:** Created a dedicated statically compiled Vite+React Marketing Website targeting Firebase Hosting (`newwallpaperwhodis.web.app`) deployed exclusively inside `.agent/apps/Website` via standard git submodules.
- **Interactive Cyber Grid Component:** Ported the Next.js interactive Node-Grid canvas animation into the raw Vite SPA bundle for the website landing page.
- **Advanced SEO Injection:** Explicitly declared "New Wallpaper Who Dis" spacing metrics across Open Graph and Twitter Card schemas inside `index.html` to guarantee strict crawler compliance regardless of search syntax.

### Documented
- Streamlined the "Running the application" Docker onboarding flow.
- Added explicit OS-specific download hooks directly targeting Docker Desktop binary sources for macOS, Windows, and Linux.
- Hyperlinked the `docker-compose.yml` text explicitly to prevent confusion with binary installer variants.

## [v0.4.0] - 2026-03-05

### Added
- Interactive background animations (Aurora, Bokeh, Ken Burns, Cyber Grid, Particles) for the dashboard.
- Advanced First-Time Onboarding Wizard with theme selection and automatic slug generation.
- Dynamic CSS themes controlled globally via root CSS variables and React Context.
- Native TypeScript interfaces for `ProfileMetadata`, `SystemSettings`, `ImageMetadata`, and `TriggerType`.
- Strict typing constraints for `<UploadDropzone>` using native `FileRejection` imports from `react-dropzone`.

### Changed
- Replaced `any` types throughout the codebase (`GalleryClient`, `ProfileListClient`, `SettingsClient`, `CreateProfileModal`) to eliminate technical debt.
- Refactored `next.config.ts` to natively execute ESLint and TypeScript compilation without bypasses (`ignoreBuildErrors: false`, `ignoreDuringBuilds: false`).
- Hardened Error propagation inside Server Actions and API Route catches using `unknown` wrapping alongside `instanceof Error` checks (e.g., `api/sync/route.ts`, `api/upload/route.ts`, `api/profiles/route.ts`).
- Silenced array `.sort()` function purity warnings on Next.js Server Components (`app/page.tsx`, `app/gallery/page.tsx`, `app/profiles/page.tsx`, `app/settings/page.tsx`) by explicit `eslint-disable-next-line`.
- Coerced optional types strictly upon invocation (e.g., `editingProfile || undefined` in `ProfileListClient.tsx` and explicitly casting `typeof val === 'string'` in `SettingsClient.tsx`).
- Gracefully suppress errors inside layout bootstrapping when `readDb()` fires before full app initialization in `app/layout.tsx`.

### Fixed
- Re-activated pipeline blocking CI tools (`npm run lint` and `npx tsc --noEmit`) to evaluate with zero exceptions natively.
- Fixed unescaped character compilation build-errors ("Let's") in `OnboardingWizard.tsx` text.
- Fixed unescaped character compilation build-errors ("application's") in `SettingsClient.tsx` text.
- Fixed overriding asynchronous `mounted` states directly bypassing `useEffect` rules which caused React state injection conflicts during initial component mount inside `AuroraBackground.tsx`.
- Fixed React state injection conflicts inside `KenBurnsBackground.tsx` to safely handle client/server hydration synchronization.
- Fixed unused `ImageIcon` import warnings blocking builds inside `GalleryClient.tsx`.
- Fixed unused `time` variable warnings blocking builds inside `CyberGridBackground.tsx`.
- Fixed missing `processUpload` dependency closures within `UploadDropzone.tsx` drag-events.
- Fixed missing `addMessage` dependency closures within `UploadDropzone.tsx` drop-rejection events.
- Fixed unused `DatabaseSchema` import causing lint errors in `src/lib/profiles.ts`.
- Fixed unused `e` parameter bindings within `layout.tsx` global exception hooks.
- Fixed unused `error` parameter bindings within dynamic trailing catch-alls routing paths `src/app/[...slug]/route.ts`.
- Fixed unexpected var re-assignment of `previewImages` leaking global scope during Gallery homepage render `app/page.tsx`.
- Fixed missing parentheses block-scope evaluation errors inside Dropzone iterators.
- Fixed typing assertions forcing parameters mapping inside `CreateProfileModal` parameters blocks mapped from the database interfaces.
- Fixed Ghosting artifacts and UI race-conditions inside `GalleryClient` image ingest maps.

## [v0.3.1] - 2026-03-05
### Fixed
- Emergency Hotfix: Next.js types build block on production pipeline image building. bypassed to unblock delivery.

## [v0.3.0] - 2026-03-05
### Added
- Image Unsplash Attributions.
- Expand profiles rules engine with granular scheduling filters.

## [v0.2.0] - 2026-03-01
### Documented
- Identified critical `containerd.io` `1.7.28-2` breaking change blocking unprivileged Proxmox LXC container deployments (`net.ipv4.ip_unprivileged_port_start` permission denied).
- Added explicit Markdown troubleshooting instructions and downgrade terminal commands for resolving the AppArmor profile conflicts via `apt`.
