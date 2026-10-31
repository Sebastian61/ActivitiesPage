# Date & Trip Planner: Code Review Report

**Scope:** [app.js](file:///d:/Projects/Activities_Webpage/app.js) (2,250 lines), [index.html](file:///d:/Projects/Activities_Webpage/index.html), [styles.css](file:///d:/Projects/Activities_Webpage/styles.css) (2,821 lines), [generateSeeds.js](file:///d:/Projects/Activities_Webpage/generateSeeds.js), [firebaseConfig.js](file:///d:/Projects/Activities_Webpage/firebaseConfig.js), data files, and repo hygiene.

**Severity key:** 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low

---

## 1. Bugs

### 🔴 Critical

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| B1 | **`renderTripCards()` does not exist.** It is called in `applyRemoteData` and `forcePull`. | [app.js:607](file:///d:/Projects/Activities_Webpage/app.js#L607), [app.js:756](file:///d:/Projects/Activities_Webpage/app.js#L756) | **Live sync UI is broken.** On a partner update, the code throws right after `updateCounters()`. The `try/catch` swallows the error, so map markers, tables, and selected cards never re-render, but the "Synced live update from partner!" toast still shows. **Force Pull** saves the data and then shows `Pull failed: renderTripCards is not defined`. |
| B2 | **Deleted default trips come back.** `loadData` re-adds any `DEFAULT_TRIPS` entry that is missing, matching by id *or* name. | [app.js:842-851](file:///d:/Projects/Activities_Webpage/app.js#L842-L851) | Delete "Canada", then reload, and it's back. If this device made the last cloud write, `autoSync` skips the remote data ([app.js:647](file:///d:/Projects/Activities_Webpage/app.js#L647)), so the restored trip stays and gets pushed to the cloud on the next save. |
| B3 | **Activities you re-add can be silently deleted.** `sanitizeActivitiesList` drops any item whose title is in `DEPRECATED_ACTIVITY_TITLES`. It runs on every load and every sync. | [app.js:768-826](file:///d:/Projects/Activities_Webpage/app.js#L768-L826) | If either of you adds e.g. `露營`, `看日出`, or `打麻將`, it vanishes on the next reload or sync. The search placeholder even suggests `露營` ([index.html:410](file:///d:/Projects/Activities_Webpage/index.html#L410)). |
| B4 | **Startup crashes if there are fewer than 4 activities.** `renderActivityCard(state.activities[3])` uses a hard-coded index. | [app.js:2241](file:///d:/Projects/Activities_Webpage/app.js#L2241) | `act.title` on `undefined` throws a TypeError. `init()` stops before `cloudSync.autoSync()`, so **cloud sync never starts**. |

### 🟠 High

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| B5 | **Duplicate element ID `btnOpenAddTripModal`.** | [index.html:114](file:///d:/Projects/Activities_Webpage/index.html#L114) and [index.html:440](file:///d:/Projects/Activities_Webpage/index.html#L440) | `getElementById` only finds the first one, so the "+ Add Destination" button inside the Manage modal does nothing. |
| B6 | **Activity table only shows 100 rows.** It renders `filtered.slice(0, 100)` and gives no indication that rows are missing. | [app.js:1446](file:///d:/Projects/Activities_Webpage/app.js#L1446) | The seed list has **175** activities. Items 101-175 can't be seen, checked, or deleted unless you search for them. |
| B7 | **Default seed objects get mutated.** `state.activities = window.DEFAULT_ACTIVITIES` keeps the same object references. Trips are only shallow-copied, `saveData` assigns `DEFAULT_TRIPS` itself, and the heal loop pushes the default objects directly. | [app.js:863](file:///d:/Projects/Activities_Webpage/app.js#L863), [app.js:840-847](file:///d:/Projects/Activities_Webpage/app.js#L840-L847), [app.js:888](file:///d:/Projects/Activities_Webpage/app.js#L888), [app.js:601](file:///d:/Projects/Activities_Webpage/app.js#L601) | **"Reset to ThingsToDo.txt Original"** keeps any completed/visited flags and edits made earlier in the same session. `unshift` on trips also mutates `DEFAULT_TRIPS`. Fix: deep-clone, e.g. `structuredClone(window.DEFAULT_ACTIVITIES)`. |
| B8 | **Manage "view" gets stuck.** `setView('manage')` sets `.view-manage`, which has no CSS, so both panels render side by side behind the modal. Closing the modal with the backdrop or Escape hides it directly and skips `closeManageModal()`, so the Collection tab stays active and the layout stays broken. | [app.js:1384-1402](file:///d:/Projects/Activities_Webpage/app.js#L1384-L1402), [app.js:2072-2093](file:///d:/Projects/Activities_Webpage/app.js#L2072-L2093) | Broken layout and nav state after closing the modal with Escape or a click outside it. |
| B9 | **The Firebase config UI doesn't work.** (a) `getEffectiveConfig` always prefers `window.FIREBASE_CONFIG`, so a saved custom config is ignored. (b) `initFirebase` won't re-initialize once `firebase.apps.length > 0`. (c) `cloudSync.roomId` and `connectRoom` don't exist (leftovers from a removed "rooms" feature). (d) `autoSync()` is never called after saving. | [app.js:486-501](file:///d:/Projects/Activities_Webpage/app.js#L486-L501), [app.js:528](file:///d:/Projects/Activities_Webpage/app.js#L528), [app.js:2138-2139](file:///d:/Projects/Activities_Webpage/app.js#L2138-L2139) | "Save & Apply Config" claims success but nothing changes. |
| B10 | **Local edits are lost before connecting or while offline.** `schedulePush` returns early when `!connected`. When the connection comes up, the initial `get()` replaces local state with the cloud copy. | [app.js:685](file:///d:/Projects/Activities_Webpage/app.js#L685), [app.js:642-649](file:///d:/Projects/Activities_Webpage/app.js#L642-L649) | Anything changed offline, or in the first moments after load, is overwritten. |
| B11 | **Last-write-wins on the whole document.** Each push overwrites the full `activities` and `trips` arrays. | [app.js:694-708](file:///d:/Projects/Activities_Webpage/app.js#L694-L708) | If Seb and Lynn edit within about a second of each other, one person's change is lost. |

### 🟡 Medium

| # | Issue | Location |
|---|-------|----------|
| B12 | **`seasonSelect` is undefined.** It's a leftover from the old `<select>`. A `ReferenceError` is thrown at the end of every "Add Destination" (strict mode). | [app.js:1761-1765](file:///d:/Projects/Activities_Webpage/app.js#L1761-L1765) |
| B13 | **Remote data is applied twice on load, with a misleading toast.** Both `docRef.get()` and the first `onSnapshot` call `applyRemoteData`. The first snapshot also shows "Synced live update from partner!" and plays a ping on every page load. | [app.js:642-674](file:///d:/Projects/Activities_Webpage/app.js#L642-L674) |
| B14 | **Spin and Decide can run twice at once.** Double-clicking **Spin** or **Pick Our Getaway** starts parallel intervals, causing flicker, several "winners", and stacked confetti. Add an `isSpinning` guard or disable the button while it runs. | [app.js:1222-1262](file:///d:/Projects/Activities_Webpage/app.js#L1222-L1262), [app.js:1124-1187](file:///d:/Projects/Activities_Webpage/app.js#L1124-L1187) |
| B15 | **Eliminator shows a stale round.** `eliminatorCandidates` is never cleared after a winner. Switching back to "Draw 3" shows the finished round (2 greyed cards) instead of a new draw. The winner card can also be vetoed during the 900 ms delay. | [app.js:1345-1364](file:///d:/Projects/Activities_Webpage/app.js#L1345-L1364), [app.js:1412](file:///d:/Projects/Activities_Webpage/app.js#L1412) |
| B16 | **Map flies around on partner updates.** `applyRemoteData` calls `selectTrip()`, which calls `flyTo`, on every remote update. This is currently hidden by B1 and will show up once B1 is fixed. | [app.js:612-616](file:///d:/Projects/Activities_Webpage/app.js#L612-L616) |
| B17 | **Blank map tiles at zoom 17-18.** The tile layers have `maxZoom: 16` but the map allows `maxZoom: 18`. | [app.js:931](file:///d:/Projects/Activities_Webpage/app.js#L931), [app.js:938](file:///d:/Projects/Activities_Webpage/app.js#L938) |
| B18 | **CSS class collision on `.status-indicator`.** It's defined for both the date-card status and the sync-modal row, so each picks up the other's styles. | [styles.css:1217](file:///d:/Projects/Activities_Webpage/styles.css#L1217), [styles.css:1890](file:///d:/Projects/Activities_Webpage/styles.css#L1890) |
| B19 | **Coordinates of 0 are treated as missing.** `parseFloat(...) \|\| 25.0` and `!trip.lat` treat 0 as falsy. A trip with an empty latitude is silently placed in Taipei instead of being rejected. | [app.js:1694-1695](file:///d:/Projects/Activities_Webpage/app.js#L1694-L1695), [app.js:967](file:///d:/Projects/Activities_Webpage/app.js#L967), [app.js:1003](file:///d:/Projects/Activities_Webpage/app.js#L1003) |
| B20 | **You can't clear tags or the description when editing a trip.** Empty input falls back to the old value. | [app.js:1718-1721](file:///d:/Projects/Activities_Webpage/app.js#L1718-L1721) |
| B21 | **You can't delete every trip.** The `saveData` fail-safe re-inserts all 13 defaults when `trips` is empty. | [app.js:887-889](file:///d:/Projects/Activities_Webpage/app.js#L887-L889) |

### ⚪ Low

- **B22** The trip form doesn't check that `minDays <= maxDays` ([app.js:1696-1697](file:///d:/Projects/Activities_Webpage/app.js#L1696-L1697)).
- **B23** `completedAt` uses `toLocaleDateString()`. The format differs by device and locale and can't be sorted, so store ISO dates instead ([app.js:1370](file:///d:/Projects/Activities_Webpage/app.js#L1370), [app.js:1463](file:///d:/Projects/Activities_Webpage/app.js#L1463)).
- **B24** JSON import:
  - The file input is never reset, so the same file can't be imported twice.
  - Imported data isn't validated or sanitized.
  - `selectedTrip` and `selectedActivity` are left pointing at stale objects.
  - See [app.js:1810-1831](file:///d:/Projects/Activities_Webpage/app.js#L1810-L1831).
- **B25** `URL.revokeObjectURL` runs right after `a.click()`, which can cancel the download in some browsers. Wrap it in `setTimeout` ([app.js:1807](file:///d:/Projects/Activities_Webpage/app.js#L1807)).
- **B26** New trips get the tag `'New Spot'`, while seeded trips use `'#New Spot'`, so the data is inconsistent ([app.js:1747](file:///d:/Projects/Activities_Webpage/app.js#L1747)).
- **B27** `sha256Fallback` returns `''` for any character above U+00FF. Passcodes with Chinese characters can never match over plain HTTP, e.g. when testing on a phone via a LAN IP ([app.js:275](file:///d:/Projects/Activities_Webpage/app.js#L275)).
- **B28** `spinEliminator` shuffles with `sort(() => 0.5 - Math.random())`, which is biased. Use Fisher-Yates ([app.js:1308](file:///d:/Projects/Activities_Webpage/app.js#L1308)).
- **B29** In the slider handlers, `lastMin`/`lastMax` start as strings but are compared to numbers, so the first input always ticks ([app.js:1924-1925](file:///d:/Projects/Activities_Webpage/app.js#L1924-L1925)).
- **B30** The HTML hard-codes stale counts (`245`, `11 Saved Spots`) and Hokkaido card content. These flash before JS runs ([index.html:75](file:///d:/Projects/Activities_Webpage/index.html#L75), [index.html:118](file:///d:/Projects/Activities_Webpage/index.html#L118), [index.html:373](file:///d:/Projects/Activities_Webpage/index.html#L373)).

---

## 2. Security Concerns

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| S1 | 🟠 | **XSS through `innerHTML`.** Activity titles, trip names, regions, budgets, and seasons are put into HTML without escaping: toasts ([app.js:1731](file:///d:/Projects/Activities_Webpage/app.js#L1731), [app.js:1759](file:///d:/Projects/Activities_Webpage/app.js#L1759)), eliminator cards ([app.js:1327](file:///d:/Projects/Activities_Webpage/app.js#L1327)), and tables ([app.js:1452](file:///d:/Projects/Activities_Webpage/app.js#L1452), [app.js:1498-1502](file:///d:/Projects/Activities_Webpage/app.js#L1498-L1502)). Combined with S2, anyone can inject a script that runs on both phones. | Add an `escapeHTML()` helper or build these nodes with `textContent`. |
| S2 | 🟠 | **The Firestore database is open to anyone.** It was created in test mode, and the config is in the public repo. Anyone can read or overwrite `couples_rooms/shared`. Test-mode rules also **expire after 30 days**, after which sync stops working silently. | Add Firebase Auth (anonymous or email) and rules that limit access to your two user IDs. |
| S3 | 🟡 | **The lockscreen only hides the page.** Passcodes are stored as unsalted SHA-256 hashes in source, so short codes are easy to brute-force. The "remember me" token *is* the hash, so pasting it into `localStorage` bypasses the lock. All data is in the DOM and `localStorage` behind the overlay anyway. | Treat it as a privacy screen, not security. Real protection needs S2 (Firebase Auth). |
| S4 | ⚪ | **`new Function()` runs pasted config text as code.** This only affects the user themselves, but it isn't needed. | Remove it along with the config UI (see R1), or parse with a regex that quotes keys before `JSON.parse`. |
| S5 | ⚪ | Esri tiles are used with `attributionControl: false`. Esri's terms require attribution. | Turn attribution back on, styled small. |

---

## 3. Redundant Code & Bloat

### Files

| Item | Size | Action |
|------|------|--------|
| [seedActivities.json](file:///d:/Projects/Activities_Webpage/seedActivities.json) | 32 KB | **Never loaded by the app.** It duplicates `defaultData.js`. Delete it and stop generating it. |
| [seedTrips.json](file:///d:/Projects/Activities_Webpage/seedTrips.json) | 8 KB | Same as above. |
| `ThingsToDo.txt.bak` | 0 B | Empty file that is **still tracked by git** even though `*.bak` is in `.gitignore`. Run `git rm --cached ThingsToDo.txt.bak`. |
| [README.md](file:///d:/Projects/Activities_Webpage/README.md) | 38 B | Not bloat, but empty. Add setup steps (Firebase rules, `node generateSeeds.js`). |

### Dead or unused code in `app.js`

| Item | Location | Notes |
|------|----------|-------|
| `DEPRECATED_ACTIVITY_TITLES` and `ACTIVITY_TITLE_FIXES` (~40 lines) | [app.js:768-807](file:///d:/Projects/Activities_Webpage/app.js#L768-L807) | One-time migration that runs forever and causes B3. Remove it, or gate it behind a `sync_data_version` flag so it runs once. |
| Firebase custom-config UI: `parseFirebaseConfigInput`, the save/clear handlers, and the toggle (~80 lines JS + ~40 lines HTML) | [app.js:443-460](file:///d:/Projects/Activities_Webpage/app.js#L443-L460), [app.js:2108-2157](file:///d:/Projects/Activities_Webpage/app.js#L2108-L2157), [index.html:666-705](file:///d:/Projects/Activities_Webpage/index.html#L666-L705) | Doesn't work (B9) and isn't needed because the config is hard-coded. **R1:** remove it. |
| `cloudSync.roomId` / `connectRoom` | [app.js:2138-2139](file:///d:/Projects/Activities_Webpage/app.js#L2138-L2139) | Leftover from the removed rooms feature. |
| `cloudSync.hasConfig` | [app.js:472](file:///d:/Projects/Activities_Webpage/app.js#L472) | Written 5 times, never read. |
| `AUTH_CONFIG.STORAGE_USER` | [app.js:242](file:///d:/Projects/Activities_Webpage/app.js#L242), [app.js:396](file:///d:/Projects/Activities_Webpage/app.js#L396) | Written and removed, never read. |
| `sha256Fallback` (~70 lines) | [app.js:246-318](file:///d:/Projects/Activities_Webpage/app.js#L246-L318) | Dead weight if the site is only served over HTTPS (`crypto.subtle` is always available there). Keep it only if you test over LAN HTTP. |
| `typeof updateDualDaysSliderUI === 'function'` | [app.js:206](file:///d:/Projects/Activities_Webpage/app.js#L206) | Always true because the function declaration is hoisted. |
| `db.settings({ experimentalAutoDetectLongPolling })` | [app.js:532-538](file:///d:/Projects/Activities_Webpage/app.js#L532-L538) | Already the default in Firebase v10. |
| `Array.isArray(x) ? x : [x]` normalization | [app.js:1126-1127](file:///d:/Projects/Activities_Webpage/app.js#L1126-L1127), [app.js:1194-1196](file:///d:/Projects/Activities_Webpage/app.js#L1194-L1196), [app.js:1885](file:///d:/Projects/Activities_Webpage/app.js#L1885) | Filters are always arrays. |
| Crossover clamping in the slider `input` handlers | [app.js:1930-1933](file:///d:/Projects/Activities_Webpage/app.js#L1930-L1933), [app.js:1946-1949](file:///d:/Projects/Activities_Webpage/app.js#L1946-L1949) | `updateDualDaysSliderUI` already clamps. |
| `updateCounters()` in `init` | [app.js:2234](file:///d:/Projects/Activities_Webpage/app.js#L2234) | Redundant when `loadData → saveData` already ran it. Harmless. |

### Duplicated logic worth consolidating

| Pattern | Occurrences | Suggested helper |
|---------|-------------|------------------|
| Firestore `docRef.set({activities, trips, updatedAt, lastUpdatedBy})` | 3 ([652](file:///d:/Projects/Activities_Webpage/app.js#L652), [696](file:///d:/Projects/Activities_Webpage/app.js#L696), [719](file:///d:/Projects/Activities_Webpage/app.js#L719)) | `cloudSync.write()` / `cloudSync.docRef` getter |
| `forcePull` re-implements `applyRemoteData` | [585-627](file:///d:/Projects/Activities_Webpage/app.js#L585-L627) vs [732-765](file:///d:/Projects/Activities_Webpage/app.js#L732-L765) | `forcePull` → `applyRemoteData(doc.data())` |
| Render-everything sequence (`updateCounters` / `renderMapMarkers` / both tables) | ~6 places | `renderAll()` |
| Open/close functions for each modal, plus the modal ID list repeated twice | 5 pairs; [2072](file:///d:/Projects/Activities_Webpage/app.js#L2072), [2086](file:///d:/Projects/Activities_Webpage/app.js#L2086) | `openModal(id)`, `closeModal(id)`, `const MODAL_IDS = [...]` |
| Label maps for occasion, environment, and season | [1031](file:///d:/Projects/Activities_Webpage/app.js#L1031), [1271](file:///d:/Projects/Activities_Webpage/app.js#L1271), [1279](file:///d:/Projects/Activities_Webpage/app.js#L1279), [1319](file:///d:/Projects/Activities_Webpage/app.js#L1319), [1502](file:///d:/Projects/Activities_Webpage/app.js#L1502) | Top-level `LABELS` constant |
| `openAddTripModal` / `openEditTripModal` fill the same fields | [1560-1630](file:///d:/Projects/Activities_Webpage/app.js#L1560-L1630) | `fillTripForm(trip \| null)` |
| Min/max slider handlers are mirror copies | [1927-1967](file:///d:/Projects/Activities_Webpage/app.js#L1927-L1967) | One `bindSlider(active, other)` |
| Magic numbers `15` (max days) and `[26, 120], 4` (map home view) | ~10 places | `MAX_DAYS`, `MAP_HOME` constants |

### Trip data lives in two places

- [generateSeeds.js](file:///d:/Projects/Activities_Webpage/generateSeeds.js#L44-L229) hard-codes all 13 trips, which `defaultData.js` also contains.
- Its regex rules still reference deprecated items (`日劇`, `韓劇`, `露營`, `清空購物車`, `買家具`, `挖蛤蠣`, `國小`, `校園`).
- Activity IDs are based on position (`act_${idx+1}`), so inserting a line in `ThingsToDo.txt` changes every ID after it.
- **Suggestion:** move the trips to a `trips.json` source file and generate stable IDs (e.g., a hash of the title).

### Unused CSS ([styles.css](file:///d:/Projects/Activities_Webpage/styles.css))

- **16 unused classes:** `brand`, `brand-sub`, `brand-text`, `brand-title`, `logo-orb`, `orb-pulse`, `btn-danger-soft`, `date-card-actions`, `dc-tip-box`, `tip-sparkle`, `tip-text`, `modal-type-switcher`, `type-btn`, `room-actions-bar`, `room-input-row`, `sync-feedback`.
- **4 unused custom properties:** `--bg-card`, `--bg-surface-elevated`, `--neon-purple`, `--theme-id`.
- **12 hard-coded dark colors** (`rgba(22,28,44…)`, `#07090e`, `rgba(7,10,16…)`) ignore the theme, e.g. `.el-card` and `.lockscreen-overlay`. They look out of place in Sakura and Amber.
- **13 `!important` declarations.** Worth checking whether they're still needed.

---

## 4. Optimizations

### Rendering and DOM

- **Use event delegation for tables.** `renderActivitiesTable` and `renderTripsTable` rebuild every row and attach 2-3 listeners per row on every keystroke. Use one listener on `tbody` keyed by `data-id`, and debounce the search input (~150 ms).
- **Only render tables when the Manage modal is open.** Remote updates currently rebuild tables nobody can see.
- **Update map markers instead of rebuilding them.** `selectTrip()` → `renderMapMarkers()` destroys and recreates every marker. Keep a `Map<tripId, marker>` and toggle the `selected` class.
- **Cache DOM lookups.** `getElementById` is called hundreds of times (e.g. `updateCounters` does 7 lookups on every save). Look elements up once in an `els` object at init.
- **Debounce resize handlers.** Two separate `resize` listeners (Confetti, map) run without debouncing. Use a `ResizeObserver` on `#tripMap` instead.

### Network and loading

- **Load the Firebase SDK lazily.** The compat SDK (app + firestore, several hundred KB) blocks parsing. Add `defer`, load it after unlock, or switch to the modular v10 SDK via ESM.
- **Load fewer font weights.** Noto Sans TC loads 4 weights and Plus Jakarta Sans loads 6. CJK fonts are heavy, so use 2-3 weights each.
- **Cut down `backdrop-filter`.** Six blur layers (up to 28px) are costly on low-end phones. Reduce blur or limit it to modals.

### Sync design (fixes B10, B11, B13)

- Store each activity and trip as its own document in a subcollection (or keep the array with per-item `updatedAt` and merge on write). This removes whole-document clobbering.
- Rely only on `onSnapshot`; it already delivers the initial state, so the separate `get()` can go. Use `snapshot.metadata.hasPendingWrites` and `fromCache` instead of the `lastUpdatedBy` heuristic.
- Turn on Firestore offline persistence (`enablePersistence`). Writes then queue while offline instead of being dropped.

### Polish

- **Remember the sound setting.** The sound toggle isn't saved to `localStorage`.
- **Reuse the seed classifier for imports.** `importTextLines` marks every import as `dateNight / $$ / indoor` ([app.js:1778-1786](file:///d:/Projects/Activities_Webpage/app.js#L1778-L1786)). It could use the same regex classifier as `generateSeeds.js`.
- **Allow pinch-zoom.** `maximum-scale=1.0, user-scalable=no` blocks it, which is an accessibility problem ([index.html:5](file:///d:/Projects/Activities_Webpage/index.html#L5)).
- **Use one `<h1>`.** There are two (lockscreen and activity title), which is an SEO issue. Make the activity title an `<h2>` or `<p>`.

---

## 5. Data Quality ([defaultData.js](file:///d:/Projects/Activities_Webpage/defaultData.js))

- **The environment classifier defaults to `indoor`, which mislabels many outdoor activities**, for example:
  - `體驗滑雪`, `賞櫻花`, `看花海`, `看煙火`
  - `去動物園`, `釣魚`, `去日月潭`, `堆座有城堡的沙堡`
  - `體驗騎馬`, `體驗滑翔翼`, `去農場餵羊`, `去跑步`
  - `看棒球比賽`, `溜直排輪`, `去看泥火山`, `坐摩天輪`

  Use `any` as the fallback and add more outdoor keywords.
- **Near-duplicate:** `體驗金工` (act_50) and `金工` (act_116).
- **Some occasion and budget values are off:** `體驗滑翔翼` is `short`; `去溜冰` is marked `outdoor`, but rinks are usually indoor.

---

## 6. Suggested Fix Order

1. **B1**: remove the `renderTripCards()` calls (2 lines). This restores live sync.
2. **B4, B12**: fix the startup index and remove the `seasonSelect` block (crash fixes).
3. **B5, B6**: rename the duplicate ID and remove or raise the 100-row limit.
4. **B2, B3, B7**: remove the default-trip healing and the deprecated-title filter, and deep-clone the defaults.
5. **S1**: add an `escapeHTML` helper.
6. **S2**: lock down the Firestore rules before the test-mode rules expire.
7. **B8, B13-B15**: fix modal/view state, the duplicate snapshot handling, and spin re-entry.
8. Bloat cleanup: delete the seed JSON files, the `.bak` file, the config UI, and unused CSS.
9. Refactors (`renderAll`, generic modal helpers, delegated tables) and the sync redesign.
