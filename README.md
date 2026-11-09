# FitCheck

**Your clothes. Your silhouette. Your next look.** FitCheck helps people who own plenty of clothes but repeat the same outfits rediscover combinations in their existing wardrobe. This class project uses HTML, CSS and JavaScript.

## See it in action

Open `index.html` in a modern browser, or serve this folder with `python3 -m http.server 8000 --bind 127.0.0.1` and visit `http://127.0.0.1:8000`. Use the same hostname and port to keep accessing the same browser storage.

The first visit opens **Demo dressing room**, with a cherry tee, black trousers and white sneakers already on the model. Choose **Build a Look** to swap in a black dress or add an ivory blazer. Alongside five original generated samples, nine labeled Revolve references cover jeans, shirts, dresses, sneakers and heels. Existing demo wardrobes can use **Add Revolve examples** without resetting saved outfits or adjustments. Each reference links to its product page; clothing cutouts edited from model photos are labeled. These examples are separate from clothes owned by the user. Image sources and editing details are in `assets/demo/revolve/SOURCES.md`.

Choose **Use my own wardrobe** to manage actual owned clothing. Personal and demo wardrobes, outfits, plans and wear histories are stored separately. The avatar profile is shared, so the same selected shape preset can be used to test the demo. Uploading a garment from demo mode first switches to the personal wardrobe.

## Main features

- **Fit Studio:** choose Balanced, Straight or Fuller Curve. Each has a photographic sample model with integrated face and hair, without measurement stretching. Four complete demo looks per preset use generated styled photographs; other combinations use a labeled 2D placement preview. Optional measurement notes appear beside the figure when toggled on. Personalize and the arch frame are preserved; Build a Look shows the model beside category-filtered clothing choices.
- **Build a Look:** choose clothing photos and see them layered on the model. A new item replaces an existing item in the same category; a dress replaces top and bottoms. Layers and shoes can be added. Saved looks can be tried on again, and saving leaves the current look on the model.
- **Adjust photo:** outline a garment by dragging numbered handles or moving them with arrow keys. Add/remove points, use the whole photo, and adjust position, width, length and rotation. Placement is saved with that garment and survives backups. Changing the garment photo or category clears the old placement.
- **Owned wardrobe:** upload a JPG, PNG or WebP garment photo (up to 15 MB/50 megapixels), enter details, search/filter, edit/remove clothes and track laundry availability. Photos are resized to 600 px before browser storage.
- **Style me:** rule-based ideas using the current workspace, occasion, entered conditions, optional temperature and logged wear. Incomplete inventories show a gap rather than invent clothes. Demo items are only eligible in demo mode.
- **Saved looks, planner and insights:** save combinations, plan dates, log actual wear, correct logs, inspect usage and download/restore JSON backups. Saving and planning do not record wear. Undo is available for the most recent successful change until reload.

## What the visual preview does

One intact base PNG plus transparent garment PNG layers, in base/bottoms/tops/outerwear/shoes order (a dress replaces separates). The pose canvas is 320 x 520 units; base and prepared garment PNGs share 984 x 1599 pixels. Each preset's shoulders, waist, hips and ankles are in `human-model.js`. Body measurements are optional notes and never stretch the base or determine anchors.

`studio-layers.js` prepares full-canvas PNGs from the existing transparent demo cutouts or outlined uploads, keeping garment adjustment and saved outfits available. For real clothes, clean front-facing transparent cutouts give the best results. This is 2D outfit styling, not fabric simulation or size prediction. See [the rendering and asset guide](docs/fit-studio.md) and [generation prompts](assets/studio/PROMPTS.md).

## Storage and privacy

- `fitcheck-v1`: personal clothing, outfits, plans and wear history.
- `fitcheck-demo-v1`: demo clothing, placements, outfits, plans and wear history.
- `fitcheck-mode`: remembered demo/personal workspace selection.
- `fitcheck-avatar-v1`: optional first name, body-shape preset and measurement notes, stored canonically in centimeters but entered/displayed in US units; earlier appearance fields are retained only as legacy metadata.

Profile data and uploaded photos stay in this browser. There is no account, cloud sync, shopping integration, live weather or analytics upload. Demo PNGs load from the local `assets/demo` folder. The instructional video loads YouTube only after Play is pressed and is removed when the guide closes.

Storage quotas/private browsing/clearing browser data can affect persistence. Save failures retain the previous state and report an error. Avatar data can be downloaded/deleted separately; wardrobe backups do not overwrite the avatar. Demo backups are labeled and cannot be restored into the personal workspace. Reset demo does not alter personal data or the avatar.

Earlier retailer/illustrated examples are retained only for backup compatibility, marked unconfirmed and excluded from personal styling and previews. Their external image URLs are never fetched. Review them in My wardrobe to upload a photo of an actual owned piece or remove the earlier example. Existing uploaded photos, IDs, outfit references and wear dates are preserved.

## Files and checks

- `index.html`, `style.css`, `atelier.css`: structure, forms, layout and visual design.
- `script.js`, `experience.js`: wardrobe, outfits, storage, recommendations, planner and backups.
- `core.js`: validation, ownership, dates and suggestion rules.
- `human-model.js`, `assets/studio`: three fixed base images and the shared pose/anchor configuration. Older `assets/human` files are unused by the renderer.
- `avatar-core.js`, `atelier.js`: fixed-base preview, preset selection, optional measurement notes and backwards-compatible profile storage.
- `tryon-core.js`, `studio-layers.js`, `tryon.js`: garment selection, anchor-based placement, same-canvas PNG preparation, layering and the placement editor.
- `demo.js`, `assets/demo`: isolated demonstration wardrobe and original generated images.
- `tests`: regression checks. Run `node --test tests/*.test.js` with Node 18+.

The current suite passes **76 tests** with Node, including single-base rendering, PNG dimensions/alpha format, stable anchors, measurement independence and same-canvas garment preparation. Browser checks confirm preset selection/save/reload, the optional notes toggle, and bottom/top/outerwear/shoe ordering. Styled demo photographs cover four complete looks across three body presets; uploaded or adjusted garments use a labeled 2D placement preview. The earlier photographic-renderer notes in PROCESS.md and ASSETS.md are historical; the current implementation and assets are documented in docs/fit-studio.md.

## Publishing

Publish the full static folder, including every script, `assets/demo` and `assets/studio`. A feature-branch push does not update a site configured to deploy from `main`. If using GitHub Pages branch deployment, choose `main` and `/ (root)` in repository Settings → Pages. A successful Git push must still be followed by checking the deployment in the hosting service.
