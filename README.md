# 72F Design System Generator

![72F Studio](https://img.shields.io/badge/72F%20Studio-Design%20System-blue?style=for-the-badge)
![Penpot v2.14+](https://img.shields.io/badge/Penpot-v2.14+-black?style=for-the-badge&logo=penpot)
![License](https://img.shields.io/badge/License-Apache%202.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Awaiting%20Penpot%20Approval-orange?style=for-the-badge)

A comprehensive Penpot plugin for generating and managing atomic design systems. Built for designers who need mathematical precision and accessibility-first token foundations in seconds.

---

## ✨ Key Features

- **Atomic Design Architect** — Instantly generate Primitives (Spacing, Radii, Shadows) and Semantic Token sets
- **Native Tokens API** — Fully compatible with Penpot 2.14+ Tokens, no legacy styles or assets
- **Accessibility Engine** — Real-time WCAG 2.1 AA contrast validation for every semantic color role
- **Multi-Theme Support** — Light, Dark, and custom brand modes out of the box
- **11-Step Color Scales** — Mathematically generated HSL scales for every brand color
- **Typography System** — Full type scale with font roles, weights, line heights, and letter spacing

---

## 🚀 Installation

### Option 1 — Direct (Recommended)

No setup required. Just add the plugin URL directly in Penpot:

1. Open Penpot and go to **Main Menu → Plugin Manager**
2. Click **Install plugin**
3. Paste this URL:

```
https://72f-studio.github.io/72f-design-system-generator/manifest.json
```

4. Accept the permissions and you're ready.

> **Note:** The plugin is currently awaiting approval in the official Penpot plugin directory. Once approved, it will be installable directly from the Penpot plugin marketplace.

---

### Option 2 — Build Locally

For development or self-hosting:

```bash
git clone https://github.com/72F-Studio/72f-design-system-generator.git
cd 72f-design-system-generator
npm install
npm run build
```

Then serve the `dist/` folder with CORS headers enabled:

```bash
npx serve --cors dist
```

In Penpot, go to **Plugin Manager → Install plugin** and enter your local `manifest.json` URL (e.g. `http://localhost:3000/manifest.json`).

---

## 👨‍🎨 About

**Parth Kulkarni** — Owner & Lead Designer at 72F Studio

Building tools that bridge high-level design theory and functional developer implementation.

| | |
|---|---|
| 🌐 Studio | [72fstudio.in](https://72fstudio.in) |
| 💼 LinkedIn | [parthkulkarni98](https://www.linkedin.com/in/parthkulkarni98/) |
| 🎨 Dribbble | [72fstudio](https://dribbble.com/72fstudio) |
| 📐 Behance | [parthkulkarni7](https://www.behance.net/parthkulkarni7) |
| 🐙 GitHub | [72F-Studio](https://github.com/72F-Studio) |
| 💌 Upwork | [Hire me](https://www.upwork.com/freelancers/~01aa3fe819d66933f5) |
| 📝 Medium | [@72fstudio](https://medium.com/@72fstudio) |
| 📬 Substack | [@72fstudio](https://substack.com/@72fstudio) |

**Feature requests & bugs** → [Open an issue](https://github.com/72F-Studio/72f-design-system-generator/issues/new)

---

## 📝 License

Copyright © 2026 Parth Kulkarni / 72F Studio.  
Licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
