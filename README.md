# Cluedrop

Get clued in.

Find business competitions and programs for Ontario high school students, with every date checked against the organizer and a plan for when to start.

## What's here

- `index.html`, `styles.css`, `app.js`: the site. No framework and no build step.
- `data/listings.js`: every listing, in one file that the page, the checks and the calendar feed all read. Rules for editing it are at the top of the file.
- `data/receipts.json`: the organizer's exact sentence and link behind every fact.
- `lib/core.js`: shared logic for dates, statuses, team-size wording, message tokens and calendar files.
- `vercel.json`: sends page links like `/l/shad` and `/season` to the page. Old `/calendar` and `/trail` links open Saved.
- `api/calendar.js`: the calendar feed (`/api/calendar?l=shad,diamond`). Calendar apps subscribe to it, so date changes reach everyone's calendar. The link holds only listing ids.
- `scripts/`: the checks and a local preview server (`node scripts/dev-server.js`, then open http://localhost:4173).

## Design rules

The first screen is a Toronto skyline drawn in code (`lib/skyline.js`): daytime in light mode, evening in dark mode. Below it: how Cluedrop works, then Discover (every activity as a card, with search and filters). Saved shows the next thing to do for each saved activity. Each activity has its own page at `/l/<id>`, with a side panel of key facts on a computer. Light mode is the default and the switch at the top changes it.

- One typeface, Instrument Sans, in sentence case. No small all-caps labels.
- Colours are navy and lake blues with a fresh teal. Each status colour means one thing: teal is open, amber is 30 days or less, red is 7 days or less or overdue, grey is not open yet or closed.
- Numbers on the page come from the data (for example, the count of verified opportunities). Never round them up.
- No decorative separators, arrows, or icons that don't do something.
- Nothing that depends on a school board's calendar, because Ontario boards set their own dates.
- Motion is one system: one easing (`--ease`) and one short rise (`--rise`) for everything. The sky lags behind the city as you scroll, the header frosts over once content slides under it, and each section rises in once, the first time it comes into view. Only `opacity` and transforms are animated. The browser's own scrolling is never taken over, and all of it switches off when the device asks for reduced motion. Repaints (a filter, a save) and the Back button never replay animations.

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
2. **Descriptions are quoted too.** Each activity page says what it is, what you'll do and why it's worth it, in plain words. Every line lists the organizer quotes it rests on (`about` in `data/listings.js`), and `check-data.js` refuses a line whose quote isn't in `receipts.json`. It also keeps them short: an intro of 45 words or fewer, 2 to 3 lines of 22 words or fewer per list, and 135 words in all.
3. **Read the right page.** Check the organizer's rules, FAQ or "how to join" page, not just the landing page. Rules documents win over web pages, and conflicts between them are shown, not hidden.
4. **No estimates.** Every deadline, opening and event date on the site is one the organizer posted ("by" dates on steps are our advice, and the site says so). If they haven't posted the next one, the page says so ("Opens soon" in their words, "Dates not posted", or a step marked "Date not posted yet"), and last year's dates appear only as last year's, with their year. `check-data.js` refuses estimated dates.
5. **Re-check sources.** `scripts/verify-sources.js` re-reads every organizer page and fails if a quoted sentence changed or disappeared. A few organizer sites (and PDFs) can't be read by the script. Their quotes are marked `manual`, with the date they were last checked another way, so re-check those by hand.
6. **Someone who did it.** Before a listing is marked as checked by a student, a student who actually took part reviews the "how you get in" steps.

Run both checks before every push:

```
node scripts/check-data.js
node scripts/verify-sources.js
```
