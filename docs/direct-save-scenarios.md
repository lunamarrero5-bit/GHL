# Save a suggested outfit directly

## Story

As Khushi, a working professional, I want to save a suggested outfit directly so that I can keep a look I like without rebuilding it.

Backlog source: the team's save-an-outfit child story in the FitCheck project brief. This slice changes only the suggestion-to-save journey; the manual builder stays available.

## Scenarios written before implementation

### S1: Save without rebuilding or recording wear

Given I am viewing an outfit suggestion in the demo dressing room,
when I choose Save outfit, enter `  Dinner demo - direct save  ` (with surrounding spaces) and submit,
then the dialog closes, I remain on the suggestion, and Saved outfits contains the same pieces under the trimmed name `Dinner demo - direct save`, with no wear recorded.

### S2: Reject a missing name

Given the save dialog is open,
when I replace the name with spaces and submit,
then I see an inline request for a name, the dialog stays open, and the saved-outfit count does not increase.

### S3: Cancel without saving

Given the save dialog is open,
when I type `Do not save this` and choose Cancel,
then I return to the suggestion and no outfit with that name is saved.

### S4: Find and reuse a saved suggestion after reload

Given I have saved `Dinner demo - direct save`,
when I reload, open Saved outfits and choose Try on this look,
then the saved name and pieces persist and those pieces appear selected in Build a Look.

## Scenario results (manual)

Run in the actual in-app browser against the local site at `http://127.0.0.1:8001/index.html?v=direct-save`, in **Demo dressing room**. These were browser button/input interactions, separate from the automated handler tests. Saved outfits started at zero. Personal wardrobe data and model measurements were not edited.

| Scenario | What I did | What I expected | What happened | Result |
|---|---|---|---|---|
| S1, first run | Chose Dinner & going out, kept Mild / indoors, clicked Find outfit ideas, opened Save outfit, entered the padded name above, and saved. Opened Saved outfits and inspected the visible heading's text content. | One outfit with the trimmed name, same suggested pieces, no builder detour and no wear log. | Stayed on Dressing room and saved the black satin midi dress + white leather sneakers, but heading text was `  Dinner demo - direct save  ` with padding retained. | **FAIL: code fixed**, not the expected behavior. Used Undo to remove this test save. |
| S1, rerun | Reloaded the corrected code and repeated the padded-name save. Checked Saved outfits and Insights & backup. | Trimmed name, matching two pieces, one saved look, no wear recorded. | Heading text was exactly `Dinner demo - direct save`; count was 1; dress + sneakers matched; Insights showed 0% worn and an empty Recent wear history. Stayed on Dressing room until I navigated away. | **PASS** |
| S2 | Reopened Save outfit, entered three spaces and submitted. Also tried an empty name. Canceled afterward and checked Saved outfits. | Inline error, dialog remains open, saved count unchanged. | Both inputs showed `Enter a look name using 1–60 characters.` with focus on Look name. The dialog stayed open. Saved count remained 1. | **PASS** |
| S3 | Reopened Save outfit, typed `Do not save this`, clicked Cancel, then opened Saved outfits. | Dialog closes and no new outfit appears. | Returned to the same dinner suggestion; Saved outfits still contained only `Dinner demo - direct save`, count 1. | **PASS** |
| S4 | Reloaded the page, opened Saved outfits, then clicked Try on this look. | Saved name/pieces persist and can be reused. | The named two-piece outfit remained after reload. Build a Look selected the dress and sneakers, displayed both on the model and set the name to `Dinner demo - direct save remix`. | **PASS** |

## What changed

The suggestion card opens a short naming dialog instead of sending the user to Build a Look. Saving uses the existing validated wardrobe storage, leaves the manual builder selection alone, and gives a confirmation pointing to Saved outfits. Cancel and invalid input never create an outfit; a failed write leaves the dialog available to retry.

## What the AI got wrong, and how it was caught

The first AI-written handler checked `name.trim()` for validity but saved the untrimmed `name`. S1's padded-name input exposed the mistake: the saved heading's actual DOM text contained two leading and two trailing spaces, even though normal HTML rendering made the title look fine. The code now trims before validation and storage. S1 was rerun successfully, and a regression test asserts the exact saved string. The scenario was not relaxed to accept the bug.

## How to check it

1. Check out `codex/save-suggested-outfits` and serve the repository root with `python -m http.server 8000 --bind 127.0.0.1` (or another available local port).
2. Open the site and use Demo dressing room. If currently in the personal workspace, choose Try the demo; avoid Reset demo if you want to keep existing demo looks. Note the current Saved outfits count.
3. Open Dressing room, choose Dinner & going out and Mild / indoors, leave temperature blank, and click Find outfit ideas.
4. Run S1 with two spaces around `Dinner demo - direct save`. Confirm the dialog closes onto the suggestion, then inspect Saved outfits for the exact name and pieces. Check Insights & backup for unchanged wear history.
5. Return to Dressing room. Run S2 with spaces, then with an empty name. The inline error must appear and no extra look may be saved. Cancel to leave the dialog.
6. Reopen Save outfit and run S3 with `Do not save this`, then Cancel. Saved outfits must not increase.
7. Reload, open Saved outfits and run S4 using Try on this look. The same garment IDs must be selected and displayed in Build a Look.
8. Optional automated check: `node --test tests/*.test.js` (Node 18+). The new handler tests also cover failed writes, missing/laundry pieces, workspace changes and repeated submissions. They supplement the four browser scenarios.

The branch was created locally; no GitHub.com branch creation or second repository clone was involved. One clearly named demo outfit is retained as the walkthrough result; no real wear was logged.

Final automated result: **69 tests passed, 0 failed**, including six new direct-save handler tests. JavaScript syntax and Git whitespace checks passed. Those automated results are additional evidence, not a substitute for the four manual scenarios above.
