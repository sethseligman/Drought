export function droughtScore(team, globalMaxDays, nowMs = Date.now()) {
  if (!team.lastChampionship || team.neverWon) return 1;
  const days = Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000);
  return Math.min(days / Math.max(globalMaxDays, 1), 1);
}

export function tileOverlayOpacity(score) {
  return score * 0.45;
}
