import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { logger } from '@/services/logger'
import type { TeamInstance } from '@/types/member/instanced'
import type { TimeWindowWeek } from '@/types/time/time-window'
import type { MainskillActivation, MemberProduction, MemberSkillValue, RecipeTypeResult } from 'sleepapi-common'
import { MathUtils, berryPowerForLevel, getBerry, type BerrySet, type Island } from 'sleepapi-common'

class StrengthServiceImpl {
  /**
   * @returns the combined strength of the berry skill and strength skill values
   */
  public skillStrength(params: {
    skillActivation: MainskillActivation
    skillValues: MemberSkillValue
    berries: BerrySet[]
    island?: Island
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { skillActivation, skillValues, timeWindow, areaBonus } = params

    const strengthSkillValue = skillValues['strength'] ?? { amountToSelf: 0, amountToTeam: 0 }

    const berrySkillStrength = this.berryStrength(params)
    const skillStrength = this.skillValue({
      skillActivation,
      amount: strengthSkillValue.amountToSelf + strengthSkillValue.amountToTeam,
      timeWindow,
      areaBonus
    })
    return berrySkillStrength + skillStrength
  }

  public berryStrength(params: {
    berries: BerrySet[]
    island?: Island
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { berries, island, timeWindow, areaBonus } = params

    const timeWindowFactor = this.timeWindowFactor(timeWindow)

    let strength = 0
    for (const producedBerry of berries) {
      const favoredBerryMultiplier = island?.berries.some((berry) => berry.name === producedBerry.berry.name) ? 2 : 1

      strength +=
        producedBerry.amount *
        timeWindowFactor *
        berryPowerForLevel(producedBerry.berry, producedBerry.level) *
        areaBonus *
        favoredBerryMultiplier
    }
    return Math.floor(strength)
  }

  public skillValue(params: {
    skillActivation: MainskillActivation
    amount: number
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { skillActivation, amount, timeWindow, areaBonus } = params

    const isStrengthUnit = skillActivation.unit === 'strength'
    const isShardsUnit = skillActivation.unit === 'dream shards'

    const rounding = isStrengthUnit || isShardsUnit ? 0 : 1

    return MathUtils.round(
      isStrengthUnit
        ? amount * areaBonus * this.timeWindowFactor(timeWindow)
        : amount * this.timeWindowFactor(timeWindow),
      rounding
    )
  }

  public timeWindowFactor(timeWindow: TimeWindowWeek) {
    switch (timeWindow) {
      case 'WEEK':
        return 7
      case '24H':
        return 1
      case '8H':
        return 1 / 3
      default:
        return 1
    }
  }

  public calculateTotalStrength(params: { team: TeamInstance; areaBonus: number }): number {
    const pokemonStore = usePokemonStore()
    const { team, areaBonus } = params
    // logger.log(`team: ${JSON.stringify(team)}`)

    // Ensure recipeType is valid
    const recipeType = team.recipeType // Default to 'curry' if undefined
    const recipeTypeResult: RecipeTypeResult = team.production?.team.cooking?.[recipeType] ?? ({} as RecipeTypeResult)
    const cookingStrength = (recipeTypeResult?.weeklyStrength ?? 0) * areaBonus

    const berryStrength = (team.production?.members ?? []).reduce(
      (sum: number, member: { produceWithoutSkill: { berries: BerrySet[] } }) => {
        const berries: BerrySet[] = member.produceWithoutSkill.berries

        return (
          sum +
          this.berryStrength({
            berries,
            timeWindow: 'WEEK',
            areaBonus: areaBonus
          })
        )
      },
      0
    )

    const skillStrength = (team.production?.members ?? []).reduce((sum: number, memberProduction: MemberProduction) => {
      // Find the corresponding Pokémon using externalId from the Pokemon store
      const memberExternalId = team.members.find((memberId) => memberId === memberProduction.externalId)
      if (!memberExternalId) {
        logger.warn(`No member ID found for externalId: ${memberProduction.externalId}`)
        return sum
      }

      const pokemonData = pokemonStore.getPokemon(memberExternalId)
      if (!pokemonData) {
        logger.warn(`No Pokémon data found for externalId: ${memberProduction.externalId}`)
        return sum // Skip this member if no data is found
      }

      const skillActivation = pokemonData.pokemon.skill.getFirstActivation()
      if (!skillActivation) {
        logger.warn(`No skill activation found for Pokémon with externalId: ${pokemonData.externalId}`)
        return sum
      }

      const memberSkillStrength = StrengthService.skillStrength({
        skillActivation,
        skillValues: memberProduction.skillValue, // Use the skill values from production
        berries: memberProduction.produceFromSkill.berries, // Use the berries from production
        timeWindow: 'WEEK',
        areaBonus: areaBonus
      })

      logger.log(`Skill strength for Pokémon with externalId: ${pokemonData.externalId}: ${memberSkillStrength}`)

      return sum + memberSkillStrength
    }, 0)

    const stockpiledBerryStrength = (team.stockpiledBerries ?? []).reduce(
      (sum: number, berry: { name: string; amount: number; level: number }) => {
        return (
          sum +
          this.berryStrength({
            berries: [{ berry: getBerry(berry.name), amount: berry.amount, level: berry.level }],
            timeWindow: '24H',
            areaBonus: areaBonus
          })
        )
      },
      0
    )

    // Log all components of strength
    logger.log(`Recipe Type: ${recipeType}`)
    logger.log(`Cooking Strength: ${cookingStrength}`)
    logger.log(`Berry Strength: ${berryStrength}`)
    logger.log(`Skill Strength: ${skillStrength}`)
    logger.log(`Stockpiled Berry Strength: ${stockpiledBerryStrength}`)

    return Math.floor(cookingStrength + berryStrength + skillStrength + stockpiledBerryStrength)
  }
}
export const StrengthService = new StrengthServiceImpl()
