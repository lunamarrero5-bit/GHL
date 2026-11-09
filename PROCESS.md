# FitCheck: implementation and evaluation

FitCheck's main purpose is to style clothing a user already owns, on a model informed by their measurements and appearance. Shopping is outside this experience. The demo workspace exists only to make the class project immediately explorable before a user uploads clothes; it is labeled and isolated from personal data.

## Current user flow

1. Open the demo and see a model dressed in a tee, trousers and sneakers.
2. Set up skin tone, hair and US measurements: height in feet/inches; chest, waist and hips in inches. Optional inseam/shoulder values can be estimated, with that status visible.
3. Build a Look by selecting or swapping photo garments. Dresses replace separates; layers and shoes render last.
4. Use Adjust photo to outline a garment and position/scale/rotate its photographic layer. Save the placement and look.
5. Switch to the personal wardrobe and upload actual owned clothing. The demo data and personal data never share a storage key.
6. Reuse saved looks, plan a date, log actual wear and back up the active wardrobe.

## Scope and limitations

The avatar has shaded skin, facial features, hair and measurement-informed anatomy. Real garment photos are composited on that model. This is a local photo-placement preview, not generative photorealistic try-on, a body reconstruction or a size/fit prediction. A production rendering engine would be a separate integration; it is not present or simulated by a success screen.

A front-facing garment cutout gives the best preview. The demo images are original, generated photographic cutouts with measured alpha bounds. Real uploads can be outlined manually. No garment illustrations or retailer-image fallbacks are used.

## Verification performed

The environment has macOS JavaScriptCore but no usable Node runtime or browser launch. A temporary compatibility runner executed the actual synchronous Node-style regression files: **59 passed**. Tests cover ownership, demo opt-in, suggestion completeness, weather/laundry/recency rules, storage/recovery, US measurements, avatar validation, safe rendering, selection conflicts, outline validation, stale-photo rejection and placement backup round trips.

A separate temporary DOM harness loaded the actual HTML and browser scripts with simulated browser APIs: **48 interaction checks passed**. These included setup/review/save, optional estimates, retaining old metric values, photo uploads, live garment layers, layer ordering, replacement of conflicting pieces, saving/canceling placements, saved-look reuse, retailer-example quarantine, guide lifecycle, dressed-demo startup, demo reset, and exact preservation of personal data while editing the demo.

All five PNGs were visually inspected. Their dimensions and alpha-channel transparency were checked, and their normalized opaque bounds were used only as placement metadata. HTML labels/IDs/script targets, referenced files and Git whitespace checks were also checked.

The harness does not verify actual CSS rendering, native pointer capture, touch behavior, browser storage quotas, video playback or screen-reader operation. Before accepting the visual design, open in a desktop and mobile browser, choose different skin tones/body measurements, add the blazer, swap to a dress, drag outline points with pointer and keyboard, save/reload, switch workspaces and verify personal data is unchanged.

## Pilot outcomes to observe

- Can a user distinguish demo from personal clothing without explanation?
- Can they enter height and three body circumferences using US measurements?
- Can they upload/find a garment and see it on the model?
- Can they understand and refine photo placement without mistaking it for fit simulation?
- Can they assemble, save and reuse a combination from owned pieces?
- Do Save, Plan and Wear today communicate distinct actions?

No pilot results or production engagement claims are asserted. Before public production use, evaluate a fitting/rendering service separately and design authentication, durable storage, consent and deployment protections appropriate to that integration.
