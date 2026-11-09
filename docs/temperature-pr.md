# Validate optional temperatures and confirm conflicting conditions

## Story

As Khushi, a working professional, I want to check the temperature I enter and resolve conflicting conditions so that I can get outfit ideas suited to my plans without accidental input mistakes.

This implements a small validation slice of the existing outfit-ideas flow. No separate team backlog ID was supplied.

## Scenarios

1. Given I select Everyday & weekend and Mild / indoors and enter 68°F, when I click Find outfit ideas, then ideas appear without a warning or error.
2. Given I select Office & client meetings and Mild / indoors and enter 500°F, when I click Find outfit ideas, then an inline error requests a realistic temperature and no ideas are generated.
3. Given I select Dinner & going out and Chilly / needs a layer and enter 92°F, when I click Find outfit ideas, then a note says 92°F seems warm for Chilly and offers switching conditions or continuing anyway.
4. Given I select Everyday & weekend and Rain / check footwear and leave temperature blank, when I click Find outfit ideas, then ideas appear without an error.

## What changed

Optional temperature values now use unit-consistent validation and show errors beside the field, clearing stale suggestions. Conflicting temperatures pause generation until the user switches conditions or explicitly keeps the selection; blank temperatures and Rain remain supported. The range is −58–140°F / −50–60°C, with the existing below-16°C/above-27°C cold/hot thresholds retained for comparison.

## What the AI got wrong, and how I caught it

The earlier AI-written handler silently replaced Chilly with Hot for 92°F. Comparing it with S3 exposed the missing confirmation choice; inspecting the HTML also revealed fixed numeric bounds/native validation that could prevent S2's inline error from running. I changed the code, kept the scenarios, and added actual-handler checks for both cases. These were source inspection and automated checks, not a claimed manual browser discovery.

## Scenario results

| Scenario | Automated observation | Manual browser status |
|---|---|---|
| S1 | PASS: suggestion card contained demo-top, demo-pants and demo-shoes; no feedback | BLOCKED |
| S2 | PASS: inline realistic-temperature error; previous ideas removed | BLOCKED |
| S3 | PASS: warning before generation; Continue kept Chilly with blazer; Switch selected Hot | BLOCKED |
| S4 | PASS: blank temperature produced a Rain suggestion without an error | BLOCKED |

Manual browser runs were attempted but could not start: binding the local Python server returned `PermissionError: Operation not permitted`; Chrome launch returned `kLSNoExecutableErr`. No screenshots or manual passes are asserted. Repeat all four scenarios in a real browser before approval.

All 71 committed regression checks passed using temporary macOS JavaScriptCore compatibility tooling because Node is unavailable. A separate simulated DOM run loading the actual HTML and browser scripts passed 57 interactions. Those runs used isolated demo data and did not change existing browser wardrobes, saved outfits or wear history. Git whitespace checks passed.

## How to check it

1. Use the existing repository clone and switch to `codex/temperature-validation` (created locally; no GitHub.com branch creation or second clone).
2. Run `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root and open http://127.0.0.1:8000. Another available local port is fine.
3. Select Try the demo if necessary; preserve existing demo looks. Ensure the sample pieces are available, or use a fresh browser profile without resetting the user's existing demo.
4. Open Dressing room / What are you dressing for?, choose °F and run S1–S4 above.
5. In S2, first generate a valid suggestion so removal of stale ideas is observable. In S3, test Continue anyway, then submit again and test Switch to Hot. In S4, clear the temperature completely.
6. Record actual browser observations/screenshots in the scenario results. With Node 18+, also run `node --test tests/*.test.js`.

## Review request

Luna: please review the inline error and both conflict choices, and independently run the four browser scenarios. In particular, check that Continue keeps Chilly and its layer rather than silently switching conditions.

Publication status: prepared locally; branch push, PR creation from the user's signed-in GitHub account, and the actual GitHub review request remain pending because this environment cannot resolve GitHub and has no GitHub CLI/connector. This text is the prepared request, not a sent notification.
