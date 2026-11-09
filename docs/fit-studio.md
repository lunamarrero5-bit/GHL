# Photographic Fit Studio

## Latest visual update

The retailer reference supersedes the earlier chin-cropped illustration direction. The active presets now use complete generated photographic sample models, including integrated face and hair. There is no separate head/hair overlay, body strip deformation, or measurement line across the body. The landing-page arch and Personalize workflow remain intact. Build a Look places the model on the left and category-filtered clothing cards on the right; the mobile layout stacks the model above the clothes.

`photo-studio.js` matches four exact, unmodified demo outfits (tee/trousers/sneakers, that look with blazer, dress/sneakers, that look with blazer) across all three presets to twelve complete styled PNGs. This improves worn fabric, shadows and occlusion for these examples. They are generated sample photographs, not live virtual try-on or fit predictions. The matching check includes demo mode, garment IDs, original source images, stored placement, and editor overrides. A changed, partial or personal outfit uses the explicitly labeled 2D placement renderer instead. A missing styled photo also falls back without replacing a newer selection.

`assets/studio/photos/` contains three base photographs and twelve styled looks, each 984 x 1599 RGBA. `human-model.js` references these bases and updates the central shoulders/waist/hips/ankles for the full-head pose. Earlier illustration PNGs remain unused history. `assets/studio/photos/PROMPTS.md` records the photographic prompts.

No files or API keys are required from you to run the demo. For realistic try-on of arbitrary personal uploads, you would need a virtual try-on service/backend or additional professionally prepared outfit imagery. Current personal uploads remain local and use 2D cutout placement; measurements do not alter the body or predict sizing.

Additional files changed for this photographic update: `script.js` (category filter), `photo-studio.js` and `tests/photo-studio.test.js` (new), plus the fifteen PNGs and prompt record in `assets/studio/photos/`. The index, shared configuration, avatar copy, renderer, CSS, avatar tests and README are updated. The suite now passes 76 tests, including all twelve asset matches, image dimensions, and rejection of edited or personal garments.

Browser checks for the photographic update passed on local port 8003: default tee/trousers/sneakers; adding the blazer; selecting a dress removes separates and displays the dress/blazer photograph; Tops filter preserves the selected outfit; removing sneakers switches to the labeled 2D preview; Personalize opens and Straight selects a separate base; cancel preserves Fuller Curve; reload retains the profile. No browser console errors were recorded. Mobile touch and screen-reader verification remain outstanding. Screenshot: `fitcheck-photographic-studio.png` in the task visualization folder.

The following section records the initial fixed-pose rebuild; its illustration-specific asset descriptions are historical.

## What changed in the rendering

Before: the body photograph was repeated in 104 SVG strips and stretched by measurements. Separate photographic hair was tinted and composited over it. SVG guide paths crossed the body, and garment photos were positioned in independent cropped rectangles.

Now: each preview displays **one intact base PNG** from a three-image preset set. No body strips, generated face, hair overlay, measurement-driven transforms or lines are rendered. The same arch and page layout wrap the figure. Personalize selects Balanced, Straight or Fuller Curve, with optional measurement notes stored separately from the visual shape.

## One pose, one configuration

`human-model.js` defines the 320 x 520 logical canvas, the 984 x 1599 asset canvas, each preset's image, and its shoulders/waist/hips/ankles. `garmentBox` derives all category placement from these anchors. No body width/height is calculated from entered measurements. To add a fourth or fifth preset, supply its base PNG and anchor coordinates here, then add the option to `avatar-shape` in `index.html`.

The three PNGs have the same dimensions and transparent background, with a neutral chin-cropped illustration and integrated soft feet shadow. They are separate generated images, not stretched copies.

`studio-layers.js` loads a garment cutout, applies its existing outline/placement adjustments, and prepares a transparent PNG at exactly 984 x 1599. Canvas is used only to prepare the garment, never to redraw or deform the body. The resulting full-canvas images are displayed over the base in DOM order: **base, bottoms, tops, outerwear, shoes**. A dress replaces top and bottoms and is drawn before outerwear and shoes.

The image preparation cache is bounded and failed image loads produce a visible message. Wardrobe records and photo-placement backups retain their existing format. Previously customized garment placement may need to be reset or refined for the new pose using Adjust photo.

## Measurement notes and compatibility

The Measurement notes checkbox is off by default. It reveals a small panel beside the figure with saved height/chest/waist/hip notes, or explains that none have been entered. It never draws marks across the base image. Tutorial diagrams also use the intact image, with instructions outside it.

Personalize preserves the existing three-step dialog: choose a preset, optionally enter measurements, then review/save. All measurements can be skipped. If entering notes, provide height, chest, waist and hips together; optional inseam/shoulders retain the existing estimated-value labels. Measurements do not change the illustration or garment anchors.

Old profiles default to Balanced and retain their saved name and measurements. Earlier skin/hair fields remain readable as legacy metadata but do not select or render body/hair imagery. Existing photographic human/hair assets remain on disk for compatibility/history and are not referenced by the new renderer.

## Assets included / what you need to supply

Included: `assets/studio/base-balanced.png`, `base-straight.png`, `base-curve.png`; their prompt set is in `assets/studio/PROMPTS.md`. Existing transparent demo garment PNGs are reused. No image files or API keys are needed from you to run this version.

For your real wardrobe, supply front-facing transparent PNG garment cutouts in the same neutral pose, ideally with straight symmetrical sleeves/legs and a clean alpha channel. Supply clean, tightly framed cutouts, not a screenshot containing a model or background. The app uses the existing Adjust photo outline/placement tool and normalizes the cutout to the base canvas for display. A JPEG background cannot become a clean transparent cutout automatically; source images authored with their own full-canvas padding would need separate source-landmark metadata rather than being treated as tightly cropped garments.

For the most accurate retailer-style visuals, commission garment cutouts for each preset. The app aligns 2D layers; it does not predict garment fit, reconstruct fabric, wrap sleeves around arms or synthesize unseen garment surfaces. The fixed base avoids the former stretching/banding problem, while visual quality still depends on source-cutout pose and tailoring.

## Verification

- Unit tests verify a single intact base image; no hair/clip strips/guide paths; three distinct preset assets; PNG dimensions and RGBA; frozen anchor config; unchanged geometry when measurements change; and different garment placement for different preset anchors.
- Browser walkthrough verifies initial dressed preview, Personalize link, selecting/saving Fuller Curve with no measurements, shared 984 x 1599 base/layer dimensions, and base → bottoms → top → blazer → shoes DOM order.
- Additional browser checks completed: notes toggle reveals an adjacent empty-notes message with no body lines; Fuller Curve survives reload; Straight selects its own base in the setup preview; canceling preserves the prior preset; selecting a dress removes top/bottom while retaining outerwear and shoes. No console errors were present on the initial rebuilt page. Broader touch/screen-reader testing remains future verification.


## Exact file manifest for this rebuild

Modified: `human-model.js`, `avatar-core.js`, `tryon-core.js`, `tryon.js`, `atelier.js`, `atelier.css`, `index.html`, `README.md`, `tests/avatar.test.js`, `tests/tryon.test.js`.

Added: `studio-layers.js`, `tests/studio-layers.test.js`, `docs/fit-studio.md`, `assets/studio/PROMPTS.md`, `assets/studio/base-balanced.png`, `assets/studio/base-straight.png`, `assets/studio/base-curve.png`.

No existing wardrobe image files or private browser records were replaced. Tests use the new local preview origin (port 8003); the earlier browser origins retain their separate data.
