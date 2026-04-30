export function droughtScore(team, sportMaxDays, sportMaxTitles = 1, nowMs = Date.now()) {
  if (!team.lastChampionship || team.neverWon) return 1;
  const days = Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000);
  const years = days / 365.25;
  const normalized = Math.min(days / Math.max(sportMaxDays, 1), 1);

  // Non-linear growth so medium/long droughts feel visually heavier.
  const curved = 1 - (1 - normalized) ** 1.7;

  // Step boost after 15 years, then more pressure every 5 years.
  const thresholdBoost = years > 15 ? Math.min(Math.floor((years - 15) / 5) * 0.06, 0.24) : 0;

  // Legacy pressure: teams with many titles "shouldn't" stay dry for long.
  const teamTitles = team.championships?.length || 0;
  const legacyRatio = Math.log1p(teamTitles) / Math.log1p(Math.max(sportMaxTitles, 1));
  const legacyBoost = 0.16 * legacyRatio * Math.min(years / 25, 1);

  return Math.min(curved + thresholdBoost + legacyBoost, 1);
}

export function tileOverlayOpacity(score) {
  return score * 0.45;
}
