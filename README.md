# FitCheck

Rediscover combinations of clothes you already own. This static HTML, CSS and JavaScript app uses a model library and requires no personal photo.

## Run

Serve the repository with `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000`. Keep the same hostname and port to retain access to browser storage. Run regression tests with Node 18+: `node --test tests/*.test.js`.

## Model and outfit preview

Personalize selects the closest full-body model by height, build, skin tone, hair style and hair color. The current library contains 72 illustrative placeholders plus Luna’s three intact photographic presets with the same portrait framing, neutral pose and plain fitted base layer (320 × 520 illustration canvas; 984 × 1599 photo canvas). Replace the images and edit `models.js` to expand or reduce the library; no fixed model count is assumed. One image element moves between home, personalization and the builder. Height applies a uniform scale capped at ±4%; body parts are never stretched or stacked.

Build a Look shows an instant flat collage of the chosen closet cutouts. A dress replaces separates, and a piece replaces the existing selection in its category. **See it on my model** runs a separate preview step. For Luna’s three photo presets and four exact original demo combinations, the local provider returns one of her twelve prepared styled photographs. Other combinations use a local, approximate on-model styling compositor. The base and result keep exactly the same canvas, framing and uniform height scale. Transparent padding is trimmed before garment sizing, each category uses body anchors, shoe pairs align to separate feet, and every cutout retains its aspect ratio. Plain light backdrops can be removed conservatively; unsuitable backgrounds return a retryable error with the collage intact. Neither path generates realistic fabric fitting. Loading, retry and timeout states leave the collage available. Changing the selection or workspace discards stale render completions.

`tryon-provider.js` exposes `createMockProvider()`, whose interface is `renderOutfit({ modelImage, garments }) => Promise<imageUrl>`. The arguments contain the selected model image and an array of garment image URLs. The active `createStudioProvider()` uses Luna’s prepared photo library when it matches and falls back to `createMockProvider()`, now a fixed-canvas local styling compositor. `garmentDetails` is optional provider metadata carrying IDs, image URLs and categories; vendors using only `modelImage` and `garments` can ignore it. Swap the provider at the construction site in `tryon.js`. A real vendor should be called through your authenticated backend, with credentials kept server-side; update the mock disclosure when connecting it.

`render-core.js` caches up to 20 results per session, keyed by model ID plus sorted garment IDs. Reordered and concurrent identical requests share a result. Replacing an image under an existing ID invalidates that entry. A cached result consumes no attempt. Five provider attempts per browser per UTC day are allowed, including failed attempts. Usage persists separately from the wardrobe and is shared across demo and personal modes. Web Locks serialize allowance reservations across tabs where supported. There is no user account: cross-device quotas and tamper-resistant per-user enforcement require the future authenticated backend. Clearing browser storage resets the local limit.

## Wardrobe and saved outfits

New demo wardrobes include the five generated garment cutouts and Luna’s nine item-only Revolve examples. Existing demo wardrobes keep all their edits and saved looks; use **Add Revolve examples** to add the nine references without resetting anything. The original tee, trousers and sneakers remain the initial selection. Category filters retain the chosen outfit. Use **Use my own wardrobe** for actual owned clothing. Uploading from the demo switches to the personal wardrobe. The demo references link to their Revolve sources and remain separate from personal uploads. No personal photo is required.

Wardrobe validation, saved outfit IDs and garments, direct Save outfit, reuse, planner, wear history, undo and backup/restore retain their existing behavior. Legacy garment fitting metadata still validates and survives backups, although the obsolete photo-placement editor and layered avatar have been removed. Retired model IDs rematch their saved preferences without invalidating outfits.

Temperature remains optional, with inline range errors and explicit choices when conditions conflict. Unit switches preserve the entered reading for validation and classification. Rain supplies a footwear reminder; choose Chilly to require a layer for cold rain.

## Storage

- `fitcheck-v1` and `fitcheck-demo-v1`: separate validated wardrobes, outfits, plans and optional `modelPreference: { modelId, preferences, name?, measurements? }` records. The optional name personalizes the welcome screen; circumference notes never alter the body image. Model preferences travel in the existing wardrobe backup.
- `fitcheck-mode`: current demo/personal mode.
- `fitcheck-render-usage-v1`: local daily render-attempt budget.
- Old `fitcheck-avatar-v1` data is left untouched for recovery and is no longer read or rendered.

Uploaded garment images and preferences stay in this browser. The current mock makes no external requests. Earlier retailer/illustrated examples remain readable for backup compatibility, but are unconfirmed and excluded from previews. Failed writes preserve the previous stored state. Demo and personal data remain separate.

## Files and verification

`models.js`, `assets/models/` and `model-core.js` define model data, matching, validation and uniform height scaling. `atelier.js` handles personalization and the single image. `garment-fit.js` defines category anchors, uniform cutout scaling, padding detection, light-background removal and separate foot placement. PNG/WebP garment imports retain transparency. `tryon.js`, `render-core.js` and `tryon-provider.js` handle collage and rendering. `core.js`, `script.js` and `experience.js` retain wardrobe, saved outfits and styling flows. `tryon-core.js` preserves selection and legacy fitting validation.

All 125 current regression tests pass under Node 22, covering model selection, library size, cache order/invalidation/deduplication, quota persistence, retry/failure, stale results, preference reload, legacy wardrobe data and existing saved-outfit flows. Luna’s fixed-preset helpers and regression tests are retained for compatibility; the old stacked body/hair renderer is not loaded by the page. Her legacy sage sample migration applies only to exact old illustrated examples and never recolors an uploaded photograph. Browser checks verified immediate matching, preference persistence after reload, collage rendering, mock generation, cache reuse without a second allowance charge, and exactly one model image in the DOM. The integrated browser run also verified Luna’s Balanced photo preset, nine added Revolve references and the prepared balanced/casual outfit photo.

## Publishing

Publish the full static folder, including all scripts, `assets/demo/`, `assets/models/` and `assets/studio/`. For GitHub Pages branch deployment choose `main` and `/ (root)`. Local changes are not deployed until committed, pushed and deployed by the host.
