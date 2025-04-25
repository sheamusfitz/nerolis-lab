<a href="https://nerolislab.com/">
  <h1 align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./backend/src/assets/banner.png">
      <img alt="Neroli's Lab" src="./backend/src/assets/banner-bright.png">
    </picture>
  </h1>
</a>

[![Discord badge][]][Discord invite]
[![codecov](https://codecov.io/gh/nerolis-lab/nerolis-lab/graph/badge.svg?token=ASFVY848GK)](https://codecov.io/gh/nerolis-lab/nerolis-lab)[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/en/v1.0.0/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![Semantic Release](https://img.shields.io/badge/Semantic_Release-semver-blue)](https://semver.org/)

Neroli's Lab is an open source tool for Pokémon Sleep data analysis. Neroli's Lab provides a publicly available [API][API docs], known as Sleep API and also provides tooling on our [beta Neroli's Lab site][nerolislab], which will replace our old website, [Sleep API][sleepapi].

## What is Neroli's Lab

Neroli's Lab exists to help users make informed decisions regarding their investments in Pokémon Sleep. We provide tooling such as the ingredient production calculator, an optimal team composition per recipe algorithm, and simulation-based cooking tier lists.

## Contributing

Thank you for considering contributing to Neroli's Lab, we welcome you with open arms. You can start by reading our [contributing guide](CONTRIBUTING.md).

## Resources

- [API documentation][API docs]
- [Discord][Discord invite]
- [Contributing to Neroli's Lab](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Apache 2.0 license](LICENSE.md)

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
