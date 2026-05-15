# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.20] - 2026-05-15
### Fixed
- Fixed the PWA release dependency to ensure it builds and uploads instantly after the release is created.

## [v1.0.18] - 2026-05-15
### Fixed
- Resolved a race condition in GitHub Actions that caused "Resource not accessible" errors.
- Improved release reliability by sequencing desktop and PWA builds.

## [v1.0.17] - 2026-05-15
### Changed
- Refactored the app to be "Standalone" with relative paths (`./`).
- The app can now be hosted on any provider (Netlify, Vercel, etc.) out of the box.

## [v1.0.10] - 2026-05-15
### Fixed
- Resolved a JSX syntax error in `App.jsx` that was breaking the build.

## [v1.0.8] - 2026-05-15
### Fixed
- Moved the Settings menu from trip-specific tabs to a global header button.

## [v1.0.7] - 2026-05-15
### Added
- Implemented a 7-day free trial for new users.
- Added a global Settings page for license management and data clearing.

## [v1.0.4] - 2026-05-14
### Added
- Integrated Lemon Squeezy monetization and licensing.
- Configured multi-platform CI/CD for Windows, macOS, and Linux.
