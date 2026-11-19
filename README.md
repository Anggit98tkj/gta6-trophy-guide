# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Anggit98tkj/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Anggit98tkj/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for every PlayStation 5 trophy in Grand Theft Auto VI. It covers all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden) with the official name, description and grade of each, a guide written for this entry in its own words that names its sources beside every trophy, and a five-stage roadmap to the platinum. The checklist saves your progress in the browser, exports it to a file and imports it back, filters by kind (story, missable, collectibles, activities) and grade, searches by name, mission or place, and hides story spoilers until a trophy is earned. One trophy is flagged missable, with a plain warning about the Chapter 1 meditation spot, and the roadmap says which chapters, stranger strands, activities and collectibles come in which order.

The names, descriptions and grades were verified against Exophase, whose 55 descriptions match this guide in order, and cross-checked against PSNProfiles-linked reporting and the PowerPyx roadmap as reported by GTA Zone. Where the official description does not pin down a place or a step, the guide says so instead of inventing one. The app is static files under `app/` with no build step and no network use at runtime: open it with the network off and it still works.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The guide loads its trophy list from `app/data/trophies.json`, saves earned trophies in localStorage, and makes no network requests. To hand the entry in, run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, which copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=e5tq5tyr&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
