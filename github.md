---
description: GitHub Project Setup Template
---

# GitHub Project Configuration

## Identity Configuration
* **Git User Name:** upioneer
* **Git User Email:** hgrand@outlook.com

## Repository Details
* **Remote URL:** https://github.com/upioneer/NewWallpaperWhoDis.git
* **Visibility:** Public
* **Default Branch:** main
* **Current Production Version:** v0.4.0

## Agent Instructions
When an agent sees this file:
1. Verify Git User Name. Prompt user if not prefilled.
2. Verify Git User Email. Prompt user if not prefilled.
3. Verify Remote URL. Prompt user if not prefilled.
4. Verify Visibility (Public/Private) if the user has not declared.
5. Initialize git (`git init`) if not already initialized.
6. Configure local identity using variables above.
7. Evaluate modified files to determine if a new semantic version tag (`v[x].[y].[z]`) is warranted. 
   - **[x] Major Version:** Major structural overhauls or breaking changes.
   - **[y] Minor Version:** New features or noticeable UI/UX enhancements.
   - **[z] Patch Version:** Bug fixes, documentation, or cosmetic non-functional changes (e.g., typos).
   - Skip bumping for documentation-only changes entirely.
9. Make commit and optionally tag the commit (e.g., `git tag v0.2.0`).
10. Push to `main` and explicitly push tags (`git push origin --tags`).

## Deployment Timeline
* **2026-03-05:** Merged `feat/collections` into main locking in the `v0.4.0` tag representing the finalized Type Safety and Technical Debt Stabilization phase.
* **2026-03-03:** Initialized git repository locally and pushed MVP payload to `main` successfully.
