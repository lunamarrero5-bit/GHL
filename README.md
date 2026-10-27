# FitCheck

**More outfits. Same closet.** A working wardrobe website for occasion-based combinations from a personal clothing catalog.

## Run

Serve this folder with any static web server, for example `python -m http.server 8000 --bind 127.0.0.1`, then visit `http://127.0.0.1:8000`. No installation, account, API key, build step or external asset service is required. Keep using the same hostname and port: browser storage belongs to that address. File URLs have browser-specific storage behavior; a local server is recommended.

## Features

- **Style me:** up to three catalog-based ideas for an occasion, conditions and optional temperature in Fahrenheit/Celsius, with reasons, swaps and optional layers. Incomplete inventories and unsupported formal dress codes show a gap instead of invented attire.
- **My closet:** add/edit clothes, upload and resize photos, choose illustration colors, search names/colors, filter by category/occasion/30-day recency, and track laundry availability. Starter clothes are examples; replace them with what you own.
- **Outfit builder:** assemble, name and save any combination. Saved looks may be partial; automatic suggestions require a top and bottom (or dress) plus shoes.
- **Saved outfits:** reuse looks, plan dates or log wear. Saving and planning never mark clothes worn.
- **Planner:** assign saved outfits to dates in an agenda. Future plans cannot be logged as already worn.
- **Insights & backup:** actual logged wear dates, usage statistics, JSON download/restore and wear-log corrections.
- **Undo last change:** reverse the most recent successful mutation in the current page session. Click again to redo. Reloading clears undo; download backups before important edits.

## Reliability and privacy

State is validated before saving/importing. Failed writes preserve the previous in-memory state. Invalid stored data enters recovery mode and is retained for download rather than silently replaced. Backups reject duplicate IDs, broken outfit/plan references, invalid dates and unsupported image URLs. Restore requires confirmation and a successful write before replacing the screen. Photos are limited to 15 MB / 50 megapixels and resized to 600 px. Broken images get an illustration fallback. Cross-tab changes refresh the current state.

Clothes and photos stay in this browser's localStorage. Quotas, private browsing and clearing site data affect persistence. Backups contain wardrobe photos and data; keep them somewhere you control. There are no accounts, cloud sync, server backups, live weather, AI chat, automatic photo segmentation, purchase imports or shopping integrations. Suggestions use transparent rules. Check garment availability, fabric warmth, waterproofing and your venue's dress code yourself.

## Verification

Run `node --test tests/core.test.js tests/storage.test.js` with Node 18+. The 23 checks cover catalog ownership, completeness, recency, laundry, weather rules, formal gaps, backup integrity, migration, storage failure, recovery and undo.

Browser walkthrough: generate a chilly dinner look, save it, reload, plan a date, verify no wear history appeared, and undo the plan. Also check formal gaps, search/filter controls and editing. See PROCESS.md for research-derived outcomes, rubrics and a pilot test plan.

## Source files

- index.html / style.css: forms, navigation and responsive design.
- core.js: pure recommendation, validation, date and recency rules.
- script.js: closet, photos, saved outfits, storage and builder.
- experience.js: styling, swaps, wear history, plans, insights, backups and editing.
- tests/: regression checks using Node's built-in runner.

This is a local-first class-project website ready for user testing. Public production use requires a separately designed backend, authentication, durable storage, monitoring and security/accessibility review. No software can be guaranteed bulletproof.
