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
  foxborough: 'Boston',
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
 * Days after the metro’s freshest Big Four title where misery reads as fully off
 * (e.g. Seattle the season after a Super Bowl — parade year still “zero misery”).
 */
const BIG_FOUR_GLORY_HONEYMOON_DAYS = 380;

/** After honeymoon, ease back to full drought weight by this many days post-title. */
const BIG_FOUR_GLORY_RAMP_END_DAYS = 750;

function smoothstep01(t) {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
}

/**
 * After any Big Four title in the metro, misery is 0 for ~a year, then ramps up.
 * (Previously the floor was 0.32 at d=0, so no city could hit zero right after a ring.)
 */
function bigFourGloryReliefMultiplier(daysSinceMostRecentBigFourTitle) {
  if (daysSinceMostRecentBigFourTitle == null || !Number.isFinite(daysSinceMostRecentBigFourTitle)) {
    return 1;
  }
  const d = Math.max(0, daysSinceMostRecentBigFourTitle);
  if (d < BIG_FOUR_GLORY_HONEYMOON_DAYS) return 0;
  if (d >= BIG_FOUR_GLORY_RAMP_END_DAYS) return 1;
  const u = (d - BIG_FOUR_GLORY_HONEYMOON_DAYS) / (BIG_FOUR_GLORY_RAMP_END_DAYS - BIG_FOUR_GLORY_HONEYMOON_DAYS);
  return smoothstep01(u);
}

/**
 * Final metro labels use this multiplier only for familiar on-map magnitudes.
 * Raw blend + glory sit ~80–150 before scale.
 */
export const METRO_MISERY_DISPLAY_SCALE = 7.5;

/**
 * After computing each metro’s base index, apply a smooth rank-based stretch so
 * #1–#5 don’t land as 864 vs 863 vs 862 (unreadable on the map). Order is preserved;
 * ties share the same rank slot.
 */
const METRO_RANK_SPREAD = 0.32;
const METRO_RANK_SPREAD_TAU = 2;

/**
 * Blend heaviest single-franchise pain with metro-wide average so huge markets
 * (many teams) do not always outrank a city with one historic drought (e.g. 2003 Boston vs NY).
 */
function blendedMetroRawMisery(sumTeamScores, peakTeamScore, teamCount, sportsCount) {
  const n = Math.max(teamCount, 1);
  const meanPush = sumTeamScores / n;
  const blend = 0.62 * peakTeamScore + 0.38 * meanPush;
  return blend + sportsCount * 5;
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
      peakScore: 0,
      teams: [],
      sports: new Set(),
    };

    current.score += teamScore;
    current.peakScore = Math.max(current.peakScore, teamScore);
    current.teams.push(team);
    current.sports.add(team.sport || 'Unknown');
    cityMap.set(metro, current);
  }

  const interim = [...cityMap.values()].map((entry) => {
    const n = entry.teams.length;
    const rawMisery = blendedMetroRawMisery(
      entry.score,
      entry.peakScore,
      n,
      entry.sports.size,
    );
    const gloryDays = metroYoungestBigFourTitleAgeDays(entry.teams, nowMs);
    const gloryFactor = bigFourGloryReliefMultiplier(gloryDays);
    const baseMisery = rawMisery * gloryFactor * METRO_MISERY_DISPLAY_SCALE;
    return {
      metro: entry.metro,
      teams: entry.teams,
      teamCount: n,
      sportsCount: entry.sports.size,
      baseMisery,
    };
  });

  interim.sort((a, b) => b.baseMisery - a.baseMisery);

  let rank = 0;
  for (let i = 0; i < interim.length; i += 1) {
    if (i > 0 && interim[i].baseMisery < interim[i - 1].baseMisery) rank = i;
    const spread = 1 + METRO_RANK_SPREAD * Math.exp(-rank / METRO_RANK_SPREAD_TAU);
    interim[i].miseryScore = interim[i].baseMisery * spread;
  }

  return interim
    .map(({ baseMisery: _b, ...row }) => row)
    .sort((a, b) => b.miseryScore - a.miseryScore);
}
