# FitCheck

**Your clothes. Your proportions. Your next look.** FitCheck helps people who own plenty of clothes but repeat the same outfits rediscover combinations in their existing wardrobe. This class project uses HTML, CSS and JavaScript.

## See it in action

Open `index.html` in a modern browser, or serve this folder with `python3 -m http.server 8000 --bind 127.0.0.1` and visit `http://127.0.0.1:8000`. Use the same hostname and port to keep accessing the same browser storage.

The first visit opens **Demo dressing room**, with a cherry tee, black trousers and white sneakers already on the model. Choose **Build a Look** to swap in a black dress or add an ivory blazer. The five original, unbranded demo images are photorealistic generated examples, not items offered for sale or clothes presumed to belong to a user. No retailer catalog, product links or shopping flow is included.

Choose **Use my own wardrobe** to manage actual owned clothing. Personal and demo wardrobes, outfits, plans and wear histories are stored separately. The avatar profile is shared, so the same personal proportions can be used to test the demo. Uploading a garment from demo mode first switches to the personal wardrobe.

## Main features

- **Personal model:** a generated photographic human reference with natural facial detail, skin texture, hands and body features. Choose among six skin-tone reference images, three photographic hairstyles (or no hair), hair color and an optional first name. Height uses feet and inches; chest/bust, waist and hips use inches. Inseam and shoulder width are optional and marked as estimated when left blank. A measurement tutorial and six illustrated instructions are available.
- **Build a Look:** choose clothing photos and see them layered on the model. A new item replaces an existing item in the same category; a dress replaces top and bottoms. Layers and shoes can be added. Saved looks can be tried on again, and saving leaves the current look on the model.
- **Adjust photo:** outline a garment by dragging numbered handles or moving them with arrow keys. Add/remove points, use the whole photo, and adjust position, width, length and rotation. Placement is saved with that garment and survives backups. Changing the garment photo or category clears the old placement.
- **Owned wardrobe:** upload a JPG, PNG or WebP garment photo (up to 15 MB/50 megapixels), enter details, search/filter, edit/remove clothes and track laundry availability. Photos are resized to 600 px before browser storage.
- **Style me:** rule-based ideas using the current workspace, occasion, entered conditions, optional temperature and logged wear. Incomplete inventories show a gap rather than invent clothes. Demo items are only eligible in demo mode.
- **Saved looks, planner and insights:** save combinations, plan dates, log actual wear, correct logs, inspect usage and download/restore JSON backups. Saving and planning do not record wear. Undo is available for the most recent successful change until reload.

## What the visual preview does

The local preview composites actual uploaded garment photos (or transparent demo PNGs) on a photographic human reference whose approximate body proportions respond to measurements. The face is preserved while the torso/leg reference is adjusted; hair is a separate photographic layer above the garments. For user uploads, a front-facing flat-lay or a transparent cutout gives the cleanest result. The outline tool can exclude a person or background from a clothing photo. Adjustments are visual placements, not garment dimensions.

The human references are generated fictional people, not photographs or exact likenesses of the user. This is **not generative AI garment fitting**, a body scan, fabric/drape simulation or a clothing-size recommendation. The proportions are approximate. A dedicated rendering service/backend would be required for production-quality generated model photos and realistic garment fitting. No such service is connected, and no API keys are required for the current app.

## Storage and privacy

- `fitcheck-v1`: personal clothing, outfits, plans and wear history.
- `fitcheck-demo-v1`: demo clothing, placements, outfits, plans and wear history.
- `fitcheck-mode`: remembered demo/personal workspace selection.
- `fitcheck-avatar-v1`: optional first name, appearance and measurements, stored canonically in centimeters but entered/displayed in US units.

Profile data and uploaded photos stay in this browser. There is no account, cloud sync, shopping integration, live weather or analytics upload. Demo PNGs load from the local `assets/demo` folder. The instructional video loads YouTube only after Play is pressed and is removed when the guide closes.

Storage quotas/private browsing/clearing browser data can affect persistence. Save failures retain the previous state and report an error. Avatar data can be downloaded/deleted separately; wardrobe backups do not overwrite the avatar. Demo backups are labeled and cannot be restored into the personal workspace. Reset demo does not alter personal data or the avatar.

Earlier retailer/illustrated examples are retained only for backup compatibility, marked unconfirmed and excluded from personal styling and previews. Their external image URLs are never fetched. Review them in My wardrobe to upload a photo of an actual owned piece or remove the earlier example. Existing uploaded photos, IDs, outfit references and wear dates are preserved.

## Files and checks

- `index.html`, `style.css`, `atelier.css`: structure, forms, layout and visual design.
- `script.js`, `experience.js`: wardrobe, outfits, storage, recommendations, planner and backups.
- `core.js`: validation, ownership, dates and suggestion rules.
- `temperature.js`: optional-temperature validation and condition-conflict checks.
- `human-model.js`, `assets/human`: photographic human/hair assets, image-space calibration and approximate body shaping.
- `avatar-core.js`, `atelier.js`: model rendering, US measurement setup and profile lifecycle. The drawn figures are retained only for instructional measurement diagrams.
- `tryon-core.js`, `tryon.js`: garment selection, clipping, layering and placement editor.
- `demo.js`, `assets/demo`: isolated demonstration wardrobe and original generated images.
- `tests`: regression checks. Run `node --test tests/*.test.js` with Node 18+.

The 78 synchronous regression checks passed using a JavaScriptCore compatibility runner in the implementation environment, where Node was unavailable. A simulated DOM walkthrough passed 63 interactions, including wardrobe separation and dressing the model. These checks do not replace real-browser rendering, touch, keyboard and screen-reader testing. See PROCESS.md and ASSETS.md for details and asset prompts. Temperature-story scenarios and current verification limits are recorded in `docs/temperature-scenarios.md`.

Temperature is optional. Unrealistic values show an inline error. When a valid temperature conflicts with the selected conditions, choose Switch conditions or Continue anyway; conditions are never silently replaced. Rain remains a separate footwear check; at cold temperatures, choose Chilly to require a layer and check rain protection yourself. Unit changes preserve the original entered reading for validation and condition classification.

## Publishing

Publish the full static folder, including every script, `assets/demo` and `assets/human`. A feature-branch push does not update a site configured to deploy from `main`. If using GitHub Pages branch deployment, choose `main` and `/ (root)` in repository Settings → Pages. A successful Git push must still be followed by checking the deployment in the hosting service.
