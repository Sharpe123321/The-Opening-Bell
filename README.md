# Opening Bell

Business competitions and programs for Ontario high school students, with every date checked against the organizer and a plan for when to start.

## What's here

- `index.html`: the whole site. A single static page with no build step and no backend.
- Listing data lives in the `DATA` array inside `index.html`. Each listing has:
  - `steps`: our suggested "do by" dates (`est: true` when they depend on an estimate)
  - `requires`: the requirements students usually miss
  - `dates`: official dates (`est: true` marks our estimates from past years)
  - `src`: the organizer page each listing was checked against
- `CHECKED` at the top of the data sets the "checked on" date shown on every listing.

## Privacy

The site collects nothing. The selected grade and view are stored in the visitor's own browser, and "Add to calendar" builds an `.ics` file on the device.

## Deploying

Hosted on Vercel as a static site. Pushing to the production branch redeploys it.

## Before every change goes live

Run the data check. It catches contradictions such as mismatched team sizes, steps out of order, a "Free" label that doesn't match the cost, or an "official deadline" step that isn't a listed deadline:

```
node scripts/check-data.js
```

Team sizes are stored once per listing as `team:{min, max}`. Write `{team}` in any sentence that mentions team size, and the site fills in the same numbers everywhere.

## How facts stay accurate

1. **Receipts.** Every fact (who can enter, how you get in, when, cost, team size) needs the organizer's exact sentence and its link in `data/receipts.json`. `scripts/check-data.js` refuses a listing that's missing one. If a fact can't be quoted, it isn't published as a fact; it's shown as "not confirmed".
2. **Read the right page.** Check the organizer's rules, FAQ or "how to join" page, not just the landing page. Rules documents win over web pages, and conflicts between them are shown, not hidden.
3. **Re-check sources.** `scripts/verify-sources.js` re-reads every organizer page and fails if a quoted sentence changed or disappeared.
4. **Someone who did it.** Before a listing is marked as checked by a student, a student who actually took part reviews the "how you get in" steps.

Run both checks before every push:

```
node scripts/check-data.js
node scripts/verify-sources.js
```
