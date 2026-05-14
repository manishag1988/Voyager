# Voyager – Setup & Build Guide
## Travel Planner + Budget Tracker | Tauri (Desktop) + PWA (Mobile)

---

## Project Structure

```
voyager/
├── src/
│   ├── App.jsx          ← Full React app (all UI + logic)
│   ├── main.jsx         ← React entry point
│   └── index.css        ← Global styles + PWA polish
├── src-tauri/
│   ├── src/main.rs      ← Tauri entry (Rust, minimal boilerplate)
│   ├── Cargo.toml       ← Rust dependencies
│   ├── build.rs         ← Tauri build script
│   ├── tauri.conf.json  ← Window size, app name, bundle config
│   └── icons/           ← App icons (see icon generation below)
├── public/
│   └── icons/           ← PWA icons (192px, 512px minimum)
├── index.html           ← HTML shell with PWA meta tags
├── vite.config.js       ← Vite + PWA plugin config
└── package.json         ← npm scripts
```

---

## Prerequisites (install once)

### All platforms
```bash
# Node.js 18+ (https://nodejs.org)
node --version   # should be 18+
npm  --version

# Rust (https://rustup.rs)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# On Windows: download rustup-init.exe from https://rustup.rs
rustc --version  # should be 1.57+
```

### Windows — additional
```
# Microsoft C++ Build Tools (choose ONE):
# Option A: Visual Studio 2022 with "Desktop development with C++"
# Option B: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# WebView2 is bundled with Windows 11. Windows 10 users:
# https://developer.microsoft.com/microsoft-edge/webview2/
```

### macOS — additional
```bash
xcode-select --install   # Xcode Command Line Tools
```

### Linux (Ubuntu/Debian) — additional
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev build-essential curl wget \
  libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### Linux (Fedora/RHEL)
```bash
sudo dnf install webkit2gtk3-devel openssl-devel curl \
  wget libappindicator-gtk3 librsvg2-devel
sudo dnf group install "C Development Tools and Libraries"
```

### Linux (Arch)
```bash
sudo pacman -Syu webkit2gtk base-devel curl wget \
  openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg
```

---

## Initial Setup

```bash
# 1. Navigate to the project folder
cd voyager

# 2. Install npm dependencies
npm install

# 3. Install Tauri CLI
npm install --save-dev @tauri-apps/cli

# 4. (Optional) Verify Tauri prerequisites
npx tauri info
```

---

## Generate App Icons

You need one master icon (1024×1024 PNG with transparency).
Save it as `app-icon.png` in the project root, then:

```bash
# Auto-generates all required sizes for all platforms
npx tauri icon app-icon.png
```

This creates icons in `src-tauri/icons/` (for Tauri/desktop)
and you should also copy 192px + 512px PNGs to `public/icons/`.

```bash
# Quick placeholder icons if you don't have one yet:
# Copy any PNG as a starting point, or use an emoji renderer online.
mkdir -p public/icons src-tauri/icons
# Then run: npx tauri icon your-icon.png
```

---

## Development (live reload, all platforms)

```bash
npm run dev           # → opens browser at http://localhost:1420

# OR: Tauri dev window (desktop native window + live reload)
npx tauri dev
```

---

## Build for Production

### PWA (Android + iPhone — installable from browser)
```bash
npm run build
# Output: dist/
# Host the dist/ folder on any static server (Netlify, Vercel, GitHub Pages, etc.)
# Users open it in Chrome/Safari and tap "Add to Home Screen"
```

### Windows (.msi + .exe)
```bash
npx tauri build
# Output: src-tauri/target/release/bundle/
#   msi/Voyager_1.0.0_x64_en-US.msi      ← installer
#   nsis/Voyager_1.0.0_x64-setup.exe      ← installer (NSIS)
```

### macOS (.dmg + .app)
```bash
npx tauri build
# Output: src-tauri/target/release/bundle/
#   dmg/Voyager_1.0.0_x64.dmg
#   macos/Voyager.app
# Note: Code signing required for distribution outside your own machine.
# For personal use, right-click → Open to bypass Gatekeeper.
```

### Linux (.AppImage + .deb)
```bash
npx tauri build
# Output: src-tauri/target/release/bundle/
#   appimage/voyager_1.0.0_amd64.AppImage   ← universal, runs anywhere
#   deb/voyager_1.0.0_amd64.deb             ← Debian/Ubuntu package
```

---

## Platform Matrix

| Platform    | Method        | Output file                  | Install |
|-------------|---------------|------------------------------|---------|
| Windows 10+ | Tauri build   | `.msi` or `.exe`             | Run installer |
| macOS 10.13+| Tauri build   | `.dmg`                       | Drag to Applications |
| Linux       | Tauri build   | `.AppImage` / `.deb`         | chmod +x / dpkg -i |
| Android     | PWA           | Browser → Add to Home Screen | No install needed |
| iPhone/iPad | PWA           | Safari → Share → Add to Home Screen | No install needed |

---

## PWA on Mobile — Step by Step

### Android (Chrome)
1. Open Chrome → navigate to your hosted URL
2. Tap the ⋮ menu → "Add to Home Screen"
3. The app icon appears on the home screen
4. Opens full-screen, works offline ✓

### iPhone / iPad (Safari — MUST use Safari)
1. Open Safari → navigate to your hosted URL
2. Tap the Share button (□↑)
3. Scroll down → "Add to Home Screen"
4. Tap "Add"
5. Opens full-screen, works offline ✓

> **Note:** iOS requires Safari for PWA install. Chrome on iOS cannot prompt for install.

---

## Data & Offline Storage

All data is stored in the browser's `localStorage` (or Tauri's WebView storage).

- **No internet required** after first load
- **Data persists** across app restarts
- **Per-device storage** — data does not sync between devices automatically
- To backup: you can export your data as JSON (add an export button to the app later)
- Storage limit: ~5–10 MB depending on the platform (plenty for travel data)

---

## Customisation Tips

| What to change | Where |
|----------------|-------|
| App name       | `package.json` → name, `src-tauri/tauri.conf.json` → productName, `index.html` → title |
| Window size    | `src-tauri/tauri.conf.json` → windows[0].width / height |
| Currency list  | `src/App.jsx` → CURRENCIES array |
| Expense categories | `src/App.jsx` → CATEGORIES array |
| Theme colours  | `src/App.jsx` → background gradient in App div |
| PWA theme colour | `vite.config.js` → manifest.theme_color |

---

## Troubleshooting

**`npx tauri info` shows missing dependencies**
→ Install the platform prerequisites listed above, then re-run.

**White screen in Tauri dev window**
→ Make sure `npm run dev` is running first (Tauri connects to the Vite dev server).

**iOS Safari won't show "Add to Home Screen"**
→ Must use Safari, not Chrome. The PWA install prompt is Safari-only on iOS.

**`error: linker 'cc' not found` on Linux**
→ `sudo apt install build-essential`

**Windows: `VCRUNTIME` error**
→ Install Visual C++ Redistributable from Microsoft's website.

**macOS: "Voyager can't be opened because it's from an unidentified developer"**
→ Right-click the `.app` → Open → Open anyway. (This is Gatekeeper for unsigned apps.)

---

## Quick Start Summary

```bash
# One-time setup
npm install

# Develop
npx tauri dev          # native window
# OR
npm run dev            # browser only

# Build everything
npm run build          # PWA (for mobile)
npx tauri build        # native desktop app
```
