# Repository Guidelines

## Versioning (Required on Every Change)

- **Always increment the app version number** (e.g., patch bump `v2.6.4` -> `v2.6.5`, or minor/major for larger releases) every time changes are made to the codebase.
- Keep all **6 version references** in [index.html](index.html) synchronized so visible badges and cache-busting query strings match:
  1. `<link rel="stylesheet" href="styles.css?v=...">`
  2. `<div class="lock-footer-version">v...</div>`
  3. `<span class="footer-version" id="appVersion">v...</span>`
  4. `<script src="firebaseConfig.js?v=..."></script>`
  5. `<script src="defaultData.js?v=..."></script>`
  6. `<script src="app.js?v=..."></script>`

