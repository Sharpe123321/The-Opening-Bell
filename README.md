# Opening Bell

Business competitions and programs for Ontario high school students, with every date checked against the organizer and a plan for when to start.

## What's here

- `index.html`, `styles.css`, `app.js`: the site. No framework and no build step.
- `data/listings.js`: every listing, in one file that the page, the checks and the calendar feed all read. Rules for editing it are at the top of the file.
- `data/receipts.json`: the organizer's exact sentence and link behind every fact.
- `lib/core.js`: shared logic for dates, statuses, team-size wording, message tokens and calendar files.
- `vercel.json`: sends page links like `/l/shad`, `/season` and `/calendar` to the page.
- `api/calendar.js`: the calendar feed (`/api/calendar?l=shad,diamond`). Calendar apps subscribe to it, so date changes reach everyone's calendar. The link holds only listing ids.
- `scripts/`: the checks and a local preview server (`node scripts/dev-server.js`, then open http://localhost:4173).

## Design rules

The site is a watchlist: each listing has a ticker and a "days left" tag, and a listing page reads like a stock page, with a chart of the student's plan. Dark mode is the default and the switch at the top changes it.

- One typeface, Instrument Sans, in sentence case. No small all-caps labels.
- Each colour means one thing: green is open or yours, orange is 30 days or less, red is 7 days or less or overdue, grey is not open yet.
- No decorative separators, arrows, tickers that scroll, or icons that don't do something.
- Nothing that depends on a school board's calendar, because Ontario boards set their own dates.

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
