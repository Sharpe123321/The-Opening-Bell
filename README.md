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
