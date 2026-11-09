# FitCheck

**The personal wardrobe atelier.** An editorial wardrobe website with a personal avatar, photographic sample pieces, and occasion-based combinations from your own clothing catalog. Built with HTML, CSS, and JavaScript.

## Run

Serve this folder with any static web server, for example `python3 -m http.server 8000 --bind 127.0.0.1`, then visit `http://127.0.0.1:8000`. No account, API key or build step is required. Keep using the same hostname and port: browser storage belongs to that address. File URLs have browser-specific storage behavior; a local server is recommended.

The starter wardrobe and featured collection use product photography hosted by REVOLVE. Existing photographic sample items from earlier versions remain supported. The optional video loads from YouTube only after Play is pressed. Those features need an internet connection. Uploaded photos, the avatar, written measuring instructions, and wardrobe tools work without those services. If a REVOLVE photo fails, the app tries another real product photograph. If neither loads, it shows a text message; it never substitutes a clothing icon. See ASSETS.md for sources and limitations.

## Features

- **Personal avatar:** the opening dressing room shows an example avatar until you set up your own. Choose skin tone, hair style/color and optional first name; enter height, chest/bust, waist, hips, inseam and shoulder width in centimeters or inches; review and save. Your avatar appears immediately on future visits in the same browser. The preview responds to your proportions. It is a stylized 2D illustration, not a body scan, photorealistic likeness, clothing size recommendation or garment fit simulation. Clothing photos appear alongside the avatar rather than being warped onto it.
- **Measurement guide:** six illustrated instructions, contextual field tips, and a click-to-load Crafty Gemini instructional video with a direct YouTube fallback. Invalid or missing measurements cannot be saved. Unit switching preserves the underlying centimeter values.
- **The FitCheck Edit:** eight real REVOLVE reference products covering tops, bottoms, layers, dresses and shoes, with original product links. New visitors receive the photographic collection as their starter wardrobe. Existing illustrated starter pieces upgrade to reference photos while keeping their IDs, saved outfit references, wear logs and availability. User-uploaded photos are preserved. Unrecognized old custom illustrations show a request for a photo instead of rendering a clothing icon. Photos do not imply ownership or a purchase; upload your own clothes to personalize the catalog.
- **Style me:** up to three catalog-based ideas for an occasion, conditions and optional temperature in Fahrenheit/Celsius, with reasons, swaps and optional layers. Incomplete inventories and unsupported formal dress codes show a gap instead of invented attire.
- **My closet:** add/edit clothes, upload and resize required garment photos, search names/colors, filter by category/occasion/30-day recency, and track laundry availability. Starter clothes are examples; replace them with what you own.
- **Outfit builder:** assemble, name and save any combination. Saved looks may be partial; automatic suggestions require a top and bottom (or dress) plus shoes.
- **Saved outfits:** reuse looks, plan dates or log wear. Saving and planning never mark clothes worn.
- **Planner:** assign saved outfits to dates in an agenda. Future plans cannot be logged as already worn.
- **Insights & backup:** actual logged wear dates, usage statistics, JSON download/restore and wear-log corrections.
- **Undo last change:** reverse the most recent successful mutation in the current page session. Click again to redo. Reloading clears undo; download backups before important edits.

## Reliability and privacy

State is validated before saving/importing. Failed writes preserve the previous in-memory state. Invalid stored data enters recovery mode and is retained for download rather than silently replaced. Backups reject duplicate IDs, broken outfit/plan references, invalid dates and unsupported image URLs. Restore requires confirmation and a successful write before replacing the screen. Photos are limited to 15 MB / 50 megapixels and resized to 600 px. Broken photos get an alternate product photo or a text-only unavailable message. New pieces require a JPG, PNG or WebP upload; editing a photographed piece keeps its photo unless replaced. Cross-tab changes refresh the current state.

Clothes and uploaded photos stay in this browser's localStorage. The avatar, optional first name and measurements are saved separately under `fitcheck-avatar-v1`; wardrobe data continues to use `fitcheck-v1`. Edit, download or delete avatar data through **My avatar**. Deleting an avatar does not delete your wardrobe. The wardrobe backup and restore feature does not include or overwrite the separate avatar profile. The avatar download is a personal data export, not a wardrobe restore file.

Quotas, private browsing and clearing site data affect persistence. Backups contain wardrobe photos and data; keep them somewhere you control. External sample-image URLs are restricted to an exact catalog allowlist; arbitrary remote image URLs are still rejected. Clearing browser data removes the avatar and wardrobe. There are no accounts, cloud sync, server backups, live weather, AI chat, automatic photo segmentation, purchase imports or shopping integrations. Suggestions use transparent rules. Check garment availability, fabric warmth, waterproofing and your venue's dress code yourself.

## Verification

Run `node --test tests/*.test.js` with Node 18+. The 42 checks cover catalog ownership, completeness, recency, laundry, weather rules, formal gaps, backup integrity, migration, storage failure, recovery, undo, measurement validation, unit conversion, safe avatar rendering, photographic starter migration, preserving uploaded photos and exact photographic URL allowlisting.

For avatar testing: open **Create my avatar**, personalize appearance, verify empty measurements are rejected, enter all six measurements, switch units, review, save and reload. Reopen to edit; close without saving; confirm the previous profile remains. Test downloading/deleting avatar data, playing/closing the guide, adding a photographic sample and saving an outfit. Test narrow screens and keyboard navigation in a real browser.

Browser walkthrough: generate a chilly dinner look, save it, reload, plan a date, verify no wear history appeared, and undo the plan. Also check formal gaps, search/filter controls and editing. See PROCESS.md for research-derived outcomes, rubrics and a pilot test plan.

## Source files

- index.html / style.css: forms, navigation and responsive design.
- atelier.css: editorial branding, photographic collection, avatar studio and responsive setup.
- catalog.js: fixed photographic example collection and allowed image URLs.
- avatar-core.js: measurement validation, unit conversion, profile persistence and SVG avatar generation.
- atelier.js: avatar setup, live preview, video guide and collection interactions.
- core.js: pure recommendation, validation, date and recency rules.
- script.js: closet, photos, saved outfits, storage and builder.
- experience.js: styling, swaps, wear history, plans, insights, backups and editing.
- tests/: regression checks using Node's built-in runner.

This is a local-first class-project website ready for user testing. Public production use requires a separately designed backend, authentication, durable storage, monitoring and security/accessibility review. No software can be guaranteed bulletproof.

## Publish updates

This repository contains a static site; publish the full folder, including every JavaScript and CSS file. Pushing a feature branch alone does not update a site hosted from `main`. If using GitHub Pages with a branch deployment, choose `main` and `/ (root)` in repository Settings → Pages, then push the completed changes to `main`. The repository does not currently include a hosting configuration, and deployment must be verified in the hosting service. A successful Git push is not by itself evidence that a public site has deployed.
