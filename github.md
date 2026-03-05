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
7. Evaluate modified files to determine if a new semantic version tag (e.g., v0.2.0) is warranted. Skip bumping for documentation-only changes.
8. Prompt the user with the proposed version bump (or skip) before committing.
9. Make commit and optionally tag the commit (e.g., `git tag v0.2.0`).
10. Push to `main` and explicitly push tags (`git push origin --tags`).

## Deployment Timeline
* **2026-03-03:** Initialized git repository locally and pushed MVP payload to `main` successfully.
