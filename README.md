# Couple Date & Trip Planner (情侶活動與旅行決策器)

A romantic, aesthetic web application for couples to discover date ideas, plan multi-day getaways, and stay synchronized in real time across devices.

## Features

- **Date Idea Randomizer**: Single card slot-machine roll and 3-card partner eliminator mode with veto capability.
- **Getaway Decider**: Multi-day trip generator with radar scanner animation and interactive dark canvas map (Esri Dark Gray).
- **Dual-Handle Range Slider**: Filter trips smoothly by duration (1 to 15+ days).
- **Atmosphere Switcher**: 5 curated aesthetic themes (Midnight Obsidian, Sakura Sunset, Bioluminescent Ocean, Warm Amber Coffee, Moonlit Lavender).
- **Real-Time Cloud Synchronization**: Instant, low-latency live sync between partner devices via Firebase Firestore (`couples_rooms/shared`).
- **Passcode Privacy Lock**: Cryptographic client-side lockscreen with SHA-256 validation.
- **Collection Hub**: Search, filter, edit, mark done, or delete activities and destinations.
- **Data Export & Import**: Backup and restore all date ideas and travel destinations as JSON or bulk plain-text import.

## Getting Started

### Local Development

No build step or bundling required! Simply serve the folder with any static file server:

```bash
# Using Node.js
npx serve .

# Or using Python
python -m http.server 5173
```

Open `http://localhost:5173` in your browser.

### Regenerating Seed Data

If you update `ThingsToDo.txt` or modify destination definitions in `generateSeeds.js`:

```bash
node generateSeeds.js
```

This updates `defaultData.js` with all 174 couple activities and 13 getaway spots.

## Firebase Firestore Rules

To secure the shared cloud document against unauthorized writes while allowing partner sync:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /couples_rooms/shared {
      allow read, write: if true; // Or restrict with Firebase Auth
    }
  }
}
```

## Security & Architecture Notes

- **XSS Sanitization**: Dynamic content in toasts, tables, and cards is strictly escaped via `escapeHTML()`.
- **Zero Heavy Dependencies**: Pure Vanilla JavaScript, HTML5, and CSS3 with Leaflet.js for maps and Web Audio API for synthetic SFX.
