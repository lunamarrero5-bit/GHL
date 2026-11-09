# FitCheck Atelier references and assets

## Visual direction

REVOLVE's storefront (https://www.revolve.com/) informed the restrained wordmark, uppercase navigation, editorial hierarchy and photography-led collection. FitCheck uses its own layout, wording and branding; no REVOLVE logo, product feed, account connection or affiliation is implied.

## Clothing photography

The current collection and starter wardrobe use real reference products from REVOLVE. Each includes a link to the original product page:

- Free People X Nova tee: https://www.revolve.com/free-people-x-nova-tee-in-high-risk-red/dp/FREE-WS5542/
- SKIMS straight-leg pant: https://www.revolve.com/skims-the-essential-pants-high-waist-straight-leg-pant-in-obsidian/dp/SIMX-WP13/
- Favorite Daughter Rivers blazer: https://www.revolve.com/favorite-daughter-the-rivers-blazer-in-khaki/dp/FAVR-WO65/
- Veja Esplar sneaker: https://www.revolve.com/veja-esplar-sneaker-in-extra-white/dp/VEJA-WZ161/
- superdown Skye mini dress: https://www.revolve.com/superdown-skye-mini-dress-in-black/dp/SPDW-WD1742/
- Bella Dahl full button-down hipster shirt: https://www.revolve.com/bella-dahl-full-button-down-hipster-shirt-in-safari-sage/dp/BLD-WS372/
- Ripley Rader ponte cropped straight-leg pant: https://www.revolve.com/ripley-rader-ponte-knit-cropped-straight-leg-pant-in-charcoal/dp/RRAD-WP27/
- ALOHAS Rosalind ballet flats: https://www.revolve.com/alohas-rosalind-ballet-flats-in-onix-burgundy/dp/ALOH-WZ229/

`catalog.js` keeps the exact image allowlist, alternate views and source URLs. Images are externally hosted; availability can change. A failed photo tries a second real product photograph and then displays “Photo unavailable.” No clothing icon is used as a fallback. Sample/reference status does not imply ownership, a purchase, stock availability or brand affiliation. Product names and color labels describe the reference garment; existing original starter names are updated when their illustrations migrate.

Previously saved real photos from DummyJSON (https://dummyjson.com/) and Fake Store API (https://fakestoreapi.com/) remain allowed to preserve existing wardrobes. They are not added to new starter wardrobes. Uploaded user photos are never replaced by the sample migration.

The previous clothing SVG renderer and illustration-color option have been removed. Legacy SVG data is still accepted for backup compatibility, but never rendered as a clothing image. Recognized starter illustrations migrate to the real reference photos without changing IDs, plans, wear history or outfit references. Other custom sketches request an actual photo. New clothing entries require a raster photo upload.

Avatar and measurement-guide figures remain original SVG drawings, separate from wardrobe product images. Review image rights or replace with owner-supplied photography before commercial use.

## Measurement instruction

The embedded instructional video is **Intro to Body Measurements for Sewing Patterns with The Crafty Gemini**, linked from the creator's measurement tutorial page:

- Creator's tutorial: https://craftygemini.com/2018/04/sewing-clothes-video-series-take-body-measurements.html
- Video: https://www.youtube.com/watch?v=ajdM2TqRehI

The video covers bust, waist and hips. FitCheck supplies six written/illustrated steps, including height, inseam and shoulder width. The player uses `youtube-nocookie.com` and loads only on a deliberate Play click. A direct source link and written instructions remain available when embedding or connectivity fails. Closing the guide removes the iframe to stop playback. The video is embedded, not downloaded or rehosted.

## Avatar scope

The avatar is an approximate, front-facing 2D illustration. It responds to measurements and appearance choices; it does not reconstruct a person's body or face. It does not predict sizes, simulate fabric, or place product photography on a 3D model. Those capabilities would require a separately evaluated avatar/virtual-fitting service and additional user consent/data handling.
