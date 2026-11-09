# Assets and interaction reference

## Original demo garment images

The built-in image_gen tool generated these original, unbranded, photorealistic sample garment images with transparency:

- `assets/demo/red-top.png`: cherry cotton tee.
- `assets/demo/black-pants.png`: black straight-leg trousers.
- `assets/demo/cream-blazer.png`: open-front ivory blazer.
- `assets/demo/black-dress.png`: black satin midi dress.
- `assets/demo/white-sneakers.png`: white low-top sneakers.

They are generated demo imagery, not photographs of actual user-owned products or merchandise offered for sale. The UI labels the demo workspace and demo pieces. The original generated PNGs are included without pixel edits. Alpha-channel bounds were inspected to set photo-placement metadata; that inspection does not alter the image files. The exact prompt set is in [assets/demo/PROMPTS.md](assets/demo/PROMPTS.md).

All garment images in the personal workspace are uploaded by the user. The site contains no retailer product gallery, prices, product links, checkout or shopping integration. Prior example-image URL formats are recognized only to recover older saved data; those photos are not loaded or displayed.

## Photographic human references

The visible model uses nine original generated photographic PNG assets in `assets/human`: six consistent adult human references with different skin tones, plus long, bob and short photographic hair cutouts. No-hair mode uses the base reference. The human is fictional; it does not represent a real user's face or an exact reconstruction of their body. Original PNGs are preserved without pixel edits.

The built-in image_gen tool generated the base human/hair assets and edited the exposed skin tone for the other five references while preserving the pose, identity and modest taupe base garment. The exact generation and editing prompts are saved in [assets/human/PROMPTS.md](assets/human/PROMPTS.md).

`human-model.js` stores the alpha-bound calibration and approximate horizontal/vertical image-space shaping. Facial proportions stay fixed when body circumferences change. Skin-tone choices select the corresponding reference photograph. Hair color applies only to the separate hair image; the face/eyes keep their photographic colors. Hair renders above the garment layers. These are local rendering operations, not a live image-generation API.

The measurement-guide diagrams remain original SVG drawings in `avatar-core.js`; the main dressing room, garment editor and setup preview use photographic human imagery. Garment layers continue to use raster clothing photos. This is a photo-compositing prototype, not a body scan or a prediction of garment size, fit or fabric drape.

## Interaction reference

REVOLVE was a reference for the idea of selecting clothes and seeing a complete look, not a source of merchandise or brand content. Its production photorealistic Build a Look experience uses a specialized provider: https://zelig.com/zelig-shoppable-closet-revolve-app/. FitCheck does not use that service, provider assets or its proprietary rendering technology.

## Measurement tutorial

The optional embedded video is Crafty Gemini's **Intro to Body Measurements for Sewing Patterns**, linked from the creator's tutorial:

- https://craftygemini.com/2018/04/sewing-clothes-video-series-take-body-measurements.html
- https://www.youtube.com/watch?v=ajdM2TqRehI

The player loads through `youtube-nocookie.com` only after Play. Written/illustrated instructions remain usable offline. Closing the guide removes the iframe to stop playback. No video is downloaded or rehosted.
