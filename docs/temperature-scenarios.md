# Temperature validation and condition confirmation

Story: As Khushi, a working professional, I want to check the temperature I enter and resolve conflicting conditions so that I can get outfit ideas suited to my plans without accidental input mistakes.

Scope: the temperature-validation slice of the existing occasion-and-conditions outfit-ideas flow. No separate backlog identifier was supplied. Branch created locally from main; no extra repository clone.

## Scenarios recorded before implementation

1. Given I am on What are you dressing for? and select Everyday & weekend and Mild / indoors and enter 68°F, when I click Find outfit ideas, then ideas appear without a warning or error.
2. Given I select Office & client meetings and Mild / indoors and enter 500°F, when I click Find outfit ideas, then an inline error asks for a realistic temperature and no ideas are generated.
3. Given I select Dinner & going out and Chilly / needs a layer and enter 92°F, when I click Find outfit ideas, then a note says 92°F seems warm for Chilly and offers switching to Hot or continuing with Chilly. Neither choice is made automatically.
4. Given I select Everyday & weekend and Rain / check footwear and leave temperature blank, when I click Find outfit ideas, then ideas appear without an error.

## Results

Manual browser execution was attempted but blocked: `python3 -m http.server 8001 --bind 127.0.0.1` failed with `PermissionError: Operation not permitted`, and launching Chrome failed with `kLSNoExecutableErr`. No actual browser steps or screenshots could be completed. These manual scenarios remain BLOCKED, not passed.

Automated fallback: a temporary simulated DOM loaded the actual HTML and browser scripts with an isolated in-memory demo wardrobe. The actual form and button handlers produced the following results. This is additional evidence, not manual browser verification.

| Scenario | Input/action in simulated page | Expected | Observed | Automated result | Manual browser result |
|---|---|---|---|---|---|
| S1 | Casual, Mild, 68°F; submit | Ideas; no feedback | Suggestion card with demo-top, demo-pants, demo-shoes; no error/warning | PASS | BLOCKED |
| S2 | Work, Mild, 500°F; submit after S1 | Inline realistic-temperature error; no ideas | “Enter a realistic temperature between −58°F and 140°F (−50°C to 60°C), or leave it blank.” Previous ideas cleared | PASS | BLOCKED |
| S3 | Going out, Chilly, 92°F; submit, then test both choices | Conflict note; explicit choice | “92°F seems warm for ‘Chilly’” note (curly double quotes in UI); no ideas until choice. Continue kept Chilly and included demo-blazer. Switch set Hot and omitted the required layer | PASS | BLOCKED |
| S4 | Casual, Rain, blank temperature; submit | Rain ideas; no error | Rain suggestion card; no error | PASS | BLOCKED |

All scenario actions left wardrobe records, saved outfits and wear history unchanged. Simulated data is separate from existing browser data; no existing user demo was reset.

The eight new committed regression tests exercise the real submit/click handlers and the temperature evaluator, including stale ideas, both conflict choices, invalid native number input, NaN/infinity, Celsius bounds and decimal values. The complete branch suite passed **71 checks** with a temporary macOS JavaScriptCore compatibility runner (Node unavailable). The separate full-page simulated DOM run passed **57 interaction checks**. Native browser input behavior, visual rendering and accessibility remain unverified.

## What the AI got wrong, and how it was caught

The earlier AI-written handler silently converted 92°F to Hot even when the user selected Chilly. Comparing that source with S3 exposed the mismatch: it could not offer the required choice. The old HTML also used fixed numeric bounds and native form validation, which could intercept 500°F before an inline application error appeared. The code was changed: explicit conflict actions, application-level validation, unit-consistent bounds and inline feedback. The supplied scenarios were retained; automated S2/S3 now verify the intended results. No manual scenario failure or screenshot is claimed.

## How to check it manually

1. Switch the existing clone to `codex/temperature-validation`. Serve the repository root with `python3 -m http.server 8000 --bind 127.0.0.1` and open http://127.0.0.1:8000. An available alternative local port is fine.
2. Use Demo dressing room / Try the demo. Do not reset an existing demo wardrobe. Use its available sample clothes; if any required pieces are in laundry, mark them ready or use a separate fresh browser profile for the demo.
3. Open Dressing room (What are you dressing for?). Select °F. Run S1–S4 with the exact occasions, conditions and values above.
4. In S2, verify both the inline message and removal of any previous suggestion card.
5. In S3, verify no ideas appear until a choice. Click Continue anyway and check that Chilly stays selected with a layer. Submit again, click Switch to Hot and check that Hot is selected. The text is a user-input check, not a live forecast.
6. In S4, clear the temperature completely before submitting. Confirm Rain stays selected.
7. Record each actual browser outcome and a screenshot or one-line observation before calling manual verification complete. Optional: with Node 18+, run `node --test tests/*.test.js`.

## Publication and review

PR title: Validate optional temperatures and confirm conflicting conditions.

PR body: `docs/temperature-pr.md`. Request review from Luna after publishing from the user's signed-in GitHub account. Publication/review-request status is recorded in that document; no approval or merge is implied.
