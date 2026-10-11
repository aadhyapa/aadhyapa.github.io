# Synthetic data

Every name, id, date and number in this folder is invented. Nothing here comes from a real company, person, product or dataset, and no real figures were used as a starting point. Any resemblance to a real business is accidental.

## Regenerate

```
npm run data
```

This runs `scripts/generate-data.mjs`, which overwrites the four JSON files below. The script uses a small seeded random function (mulberry32) and a fixed start date, so running it again gives byte-identical files. To get a different dataset, change `SEED` at the top of the script and run it again.

## Files

- `orders.json`: orders per day for 120 days from 2026-01-05, with a weekday rhythm (busy early week, quiet weekend), slow growth, four spike days, one dip and two near-empty quiet days. Odd days carry a `note` (`spike`, `dip` or `quiet`).
- `exceptions.json`: delivery exceptions, each with `orderId`, `date`, `type` (`late`, `damaged`, `address-problem`, `customs-hold`), `carrier` (an id from `carriers.json`) and `status` (`open`, `investigating`, `resolved`). Counts follow daily order volume; recent ones are more likely to be open. Customs holds only occur for international carriers.
- `carriers.json`: six invented carriers with region, on-time rate, average transit days and share of volume.
- `signal.json`: 240 values between -1 and 1 for the Signal Study artwork: two slow waves, a rising chirp and a few sharp pulses under a swelling envelope.

Do not edit the JSON by hand; change the script and regenerate.
