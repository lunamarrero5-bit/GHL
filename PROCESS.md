# FitCheck: evidence and evaluation

The supplied project brief prioritizes occasion-based outfit suggestions. Wardrobe capture supports that goal, while weather and recency are decision inputs. This website combines a finite suggestion flow with a searchable closet and manual builder. Separate Save, Wear today and Plan actions address the ambiguous keep/save labels in the testing feedback. Swaps, layers, temperature units and exact wear dates address additional feedback.

The red tee change is preserved. Existing IDs and saved outfit references survive the upgrade. Wear histories start empty instead of being invented. Starter clothes are explicitly labeled as examples.

## Observable outcomes for a pilot

Recruit working professionals who dress for office and social occasions. Obtain consent before recording. Read the birthday-dinner scenario without pointing to controls, then observe these outcomes:

| Story | Observable evidence |
|---|---|
| Add clothes | Adds a real item and finds it in the closet without help. |
| Dress for an occasion | Reaches a full combination and names one they would wear. |
| Rediscover | Finds an item not worn in 30 days and includes it in a look. |
| Check conditions | Sets conditions, notices layer/footwear guidance and explains a decision. |
| Save and return | Saves an outfit and finds it after reload. |
| Plan and wear | Schedules a look and understands that only Wear today logs wear history. |

## Session rubric

Pass when the occasion is explicit, all proposed IDs exist in the catalog, a complete base and shoes are supplied, laundry is excluded, uncertain availability is disclosed, cold input includes a layer or a gap, recency uses actual logs, alternatives are available when inventory permits, and dress-code gaps are not disguised.

The rules cannot verify ownership, fabric warmth, waterproofing or a venue dress code. The user's catalog and confirmation supply those inputs. Conditions are entered manually, not fetched from a forecast.

## Golden and adversarial scenarios

| Scenario | Expected behavior / implementation |
|---|---|
| Chilly rooftop dinner in 45 minutes | Dinner + chilly produces a full outfit and actual layer, a reason and alternatives when available. Tested. |
| Workweek planning | Save looks and manually assign dates in Planner. Automatic five-day optimization is future work. |
| Formal-ish garden party | Confirm the exact dress code yourself; the current model does not verify formal suitability. |
| An absent dress | Never propose an unknown catalog ID. Tested; free-text parsing is not implemented. |
| Work clothes for black tie | Show an explicit catalog/dress-code gap. Tested. |
| Just order something | No shopping or financial-action tools are connected. |
| Matching clothes in laundry | Show a gap rather than recommend unavailable items. Tested. |
| Corrupt backup / full storage | Reject invalid data, retain the prior state, explain failure. Tested. |

## OECs for a real pilot

Treat the brief's targets as hypotheses: more than 70% of occasion sessions view a suggestion; more than 50% of those sessions select a look; more than 30% of confirmed outfits include a piece not worn in 30 days; more than 30% of confirmed looks are saved; more than 25% of saved looks are reused within 30 days. Also measure decision time and wardrobe breadth.

These are not achieved results. No analytics are uploaded. Use a consented observation sheet with anonymous participant IDs, task start/finish times, story outcomes and comments. Agree on definitions and sample size before testing. Compare occasion-first and closet-first walkthroughs under the same dinner scenario, then merge the stronger elements based on evidence.

## Next gates

1. Observe five participants completing the core stories and correct confusion.
2. Re-run regression checks after data-model or recommendation changes.
3. Validate whether live weather, conversational input or bulk capture improves the measured outcomes before integrating services.
4. Before public production use, add authenticated durable storage, operational monitoring, security review and broader accessibility/device testing.
