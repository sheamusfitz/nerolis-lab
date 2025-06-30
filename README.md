<a href="https://nerolislab.com/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./backend/src/assets/banner.png">
    <img alt="Neroli's Lab" src="./backend/src/assets/banner-bright.png">
  </picture>
</a>

[![Discord badge][]][Discord invite]
[![codecov](https://codecov.io/gh/nerolis-lab/nerolis-lab/graph/badge.svg?token=ASFVY848GK)](https://codecov.io/gh/nerolis-lab/nerolis-lab)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/en/v1.0.0/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![Semantic Release](https://img.shields.io/badge/Semantic_Release-semver-blue)](https://semver.org/)

Neroli's Lab helps users make informed decisions regarding their investments in Pokémon Sleep. We provide tooling such as production calculators, optimal team composition algorithms, and simulation-based cooking tier lists.

## 🚀 Quick Links

- **<img src="./frontend/public/favicon.svg" width="16" height="16" alt="Website" style="vertical-align: -0.125em;"> [Live Website](https://nerolislab.com)** - Try our tools and calculators
- **<img src="https://di8m9w6rqrh5d.cloudfront.net/1zObrQ89Q4wHhgFCfYIUhMUvmNf4XjxO/big_preview_48848892-a237-4636-8aae-d5f3ff2f6482.png" width="16" alt="Discord" style="vertical-align: -0.125em;"> [Discord Community](https://discord.gg/SP9Ms69ueD)** - Get help and discuss
- **📚 [Documentation](https://docs.nerolislab.com)** - Getting started guides, architecture, and technical specifications

## 🤝 Contribute

Want to contribute? You can find out how to get started on our documentation page:

**🔗 [docs.nerolislab.com →](https://docs.nerolislab.com)**

## 📄 License

Released under the [Apache 2.0 License](LICENSE.md).

---

[Discord invite]: https://discord.gg/SP9Ms69ueD
[Discord badge]: https://img.shields.io/discord/1300099710996058252?logo=discord
[API docs]: https://api.sleepapi.net/docs
[sleepapi]: https://sleepapi.net
[nerolislab]: https://nerolislab.com

## sheamusfitz edits: the "find-optimal" code

in `backend/src/production.controller.ts`, `calculateTeam` now allows `iterations` to be packed in with the `CalculateTeamRequest`, so I can tell it specific amounts to calculate

(and there's associated changes in `production-router.ts`)

`production-service.ts` has, again, similar changes. I had to change how `iterations` was handled here, but maybe I didn't need to and I'm just inexperienced with this language...

`frontend/src/components/calculator`:
- `team-section.vue` has the optimizer thing at the bottom. The button placement isn't great, sorry, but it works. There's a whole bunch of other stuff added here for the client-side logic, and the displaying of the optimizer's progress.
- `team-slot.vue`: added a thing here on each pokemon's sprite that allows the user to 'lock' the pokemon onto the team. This forces it to be in the optimizer's team.
- `frontend/src/services`: `find-optimal.ts` is the main logic for the team optimizer.
  - `individual-strength-calculator` I stopped using this but maybe it will end up being valuable later. It runs through all the pokemon and quickly runs a calculation to get its strength in a team of 1.
  - `strength-service.ts`: added a function `calculateTotalStrength` because that wasn't its own function before: it's just calculated as needed for the calculator view.
  - `team-service.ts`: just added a thing for making the backend request for the team strength.
- `frontend/src/stores/team-store.ts`: changes made for logistics- getting the list of pokemon and list of *locked* pokemon. 
