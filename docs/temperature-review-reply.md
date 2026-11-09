Luna, I reproduced the conversion bug. The three requested regressions failed against the previous code and pass with the local fix.

The form now retains the original entered reading and unit across unit switches. It displays equivalent values without integer rounding and validates/classifies against the original reading, avoiding repeated-conversion drift. An explicit edit establishes a new reading.

The harness now includes the actual unit-change listener and dispatches all registered callbacks. Tests verify 60.1°C → 140.18°F and 140.1°F → 60.05555555555556°C remain rejected, 15.99°C stays cold, and 27°C stays Mild at 80.6°F. Additional checks cover repeated toggles, exact valid boundaries, blank input, and an explicit correction after a rejected value.

Rain is intentionally exempt from temperature-condition conflicts, but never from range validation. The current selector is a single event condition: Rain supplies a footwear/outerwear reminder and does not independently specify warmth. At 0°C, Rain alone does not require a layer. The inline helper now explains choosing Chilly to require a layer for cold rain and checking rain protection separately. Independent warmth and precipitation settings would be a separate change.

All 84 committed regression tests pass under Node 22.14.0 after merging the latest main, including the direct-save tests. Git whitespace checks pass. Your actual-browser S1–S4 PASS results and 71-test Node result at 560fe48 are acknowledged as reviewer evidence. I have not claimed an actual-browser run of this conversion fix. No existing browser data was modified.

Merged the latest main into this branch and resolved the index.html script conflict, retaining both the temperature module and the direct-save flow. Updated script cache keys so browsers load the combined code. Because iCloud-offloaded source files stalled reads, verification and integration used a temporary checkout while preserving the original workspace edits. Please re-review the conversion cases; approval remains with you.
