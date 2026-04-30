import { droughtScore } from './droughtUtils';

/** NFL / MLB / NBA / NHL — titles here anchor metro “temperature” vs sheer roster mass */
const BIG_FOUR_LEAGUES = new Set(['NFL', 'MLB', 'NBA', 'NHL']);

const METRO_BY_CITY = {
  'new york': 'New York',
  brooklyn: 'New York',
  bronx: 'New York',
  queens: 'New York',
  elmont: 'New York',
  harrison: 'New York',
  'east rutherford': 'New York',
  'newark': 'New York',
  'los angeles': 'Los Angeles',
  anaheim: 'Los Angeles',
  carson: 'Los Angeles',
  'san francisco': 'Bay Area',
  oakland: 'Bay Area',
  'san jose': 'Bay Area',
  'st. petersburg': 'Tampa Bay',
  sunrise: 'Miami',
};

function normalizeCity(city = '') {
  return city.toLowerCase().trim();
}

export function getMetroName(team) {
  const cityKey = normalizeCity(team.city);
  if (METRO_BY_CITY[cityKey]) return METRO_BY_CITY[cityKey];
  return team.city || 'Unknown';
}

/** Smallest days-since-title among Big Four franchises in this metro (fresh wins dominate). */
function metroYoungestBigFourTitleAgeDays(teams, nowMs) {
  let best = Infinity;
  let found = false;
  for (const team of teams) {
    if (!BIG_FOUR_LEAGUES.has(team.league)) continue;
    if (team.neverWon || !team.lastChampionship) continue;
    const ts = new Date(team.lastChampionship).getTime();
    if (Number.isNaN(ts)) continue;
    const days = Math.floor((nowMs - ts) / 86400000);
    if (days < 0) continue;
    found = true;
    best = Math.min(best, days);
  }
  return found ? best : null;
}

/**
 * Scale raw summed misery down after a recent Big Four title so large markets
 * (many teams) aren’t inflated vs cities with fewer franchises.
 */
function bigFourGloryReliefMultiplier(daysSinceMostRecentBigFourTitle) {
  if (daysSinceMostRecentBigFourTitle == null || !Number.isFinite(daysSinceMostRecentBigFourTitle)) {
    return 1;
  }
  const d = Math.max(0, daysSinceMostRecentBigFourTitle);
  const Y = 365;
  const Y2 = 730;
  if (d <= Y) return 0.32 + (d / Y) * 0.5;
  if (d <= Y2) return 0.82 + ((d - Y) / Y) * 0.18;
  return 1;
}

export function calculateMiseryIndex(teams, sportMaxDays, sportMaxTitles, nowMs = Date.now()) {
  const cityMap = new Map();

  for (const team of teams) {
    const metro = getMetroName(team);
    const teamScore = droughtScore(
      team,
      sportMaxDays?.[team.sport] || 1,
      sportMaxTitles?.[team.sport] || 1,
      nowMs,
    ) * 100;

    const current = cityMap.get(metro) || {
      metro,
      score: 0,
      teams: [],
      sports: new Set(),
    };

    current.score += teamScore;
    current.teams.push(team);
    current.sports.add(team.sport || 'Unknown');
    cityMap.set(metro, current);
  }

  return [...cityMap.values()]
    .map((entry) => {
      const sportsBonus = entry.sports.size * 5;
      const rawMisery = entry.score + sportsBonus;
      const gloryDays = metroYoungestBigFourTitleAgeDays(entry.teams, nowMs);
      const gloryFactor = bigFourGloryReliefMultiplier(gloryDays);
      return {
        ...entry,
        teamCount: entry.teams.length,
        sportsCount: entry.sports.size,
        miseryScore: rawMisery * gloryFactor,
      };
    })
    .sort((a, b) => b.miseryScore - a.miseryScore);
}
