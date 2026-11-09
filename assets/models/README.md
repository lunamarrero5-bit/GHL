# Model placeholders

Every SVG is a complete 320 × 520 full-body illustration in the same neutral pose and framing, with a plain fitted green base layer. Hair and body appearance are baked into the image. These are illustrative placeholders, not user likenesses or fit predictions.

Update `models.js` to add or remove models. Each entry requires `id`, `heightClass`, `build`, `skinTone`, `hairStyle`, `hairColor`, `heightCm` and `image`. Keep IDs stable and unique and paths within this folder. PNG, JPG and WebP replacements are supported. Maintain the same canvas, framing, pose and base clothing for all production images. `model-core.js` defines supported preference categories and validates metadata; extend those categories there when introducing new values.

Height classes are short below 162 cm, average from 162–175 cm, and tall above 175 cm. Matching weights are height difference / 15, height class distance × 1, build distance × 3, skin tone distance × 4, hairstyle mismatch × 2 and hair color mismatch × 1. Equal scores are resolved by model ID.
