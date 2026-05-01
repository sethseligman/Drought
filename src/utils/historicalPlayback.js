/** UTC instant at end of calendar year (for “misery as of Dec 31”). */
export function endOfYearUtcMs(year) {
  return Date.UTC(year, 11, 31, 23, 59, 59, 999);
}

/**
 * Team row as it existed on `asOfMs`: titles only through that date,
 * `neverWon` if none yet, `lastChampionship` = latest qualifying title.
 */
export function snapshotTeamAtDate(team, asOfMs) {
  const list = team.championships || [];
  const wonBy = [];
  for (const c of list) {
    const t = new Date(c.date).getTime();
    if (!Number.isNaN(t) && t <= asOfMs) wonBy.push(c);
  }

  let lastChampionship = null;
  if (wonBy.length > 0) {
    wonBy.sort((a, b) => new Date(a.date) - new Date(b.date));
    lastChampionship = wonBy[wonBy.length - 1].date;
  } else if (team.lastChampionship) {
    const t = new Date(team.lastChampionship).getTime();
    if (!Number.isNaN(t) && t <= asOfMs) lastChampionship = team.lastChampionship;
  }

  const neverWon = lastChampionship == null;

  return {
    ...team,
    lastChampionship,
    neverWon,
    championships: wonBy,
  };
}

export function snapshotTeamsAtDate(teams, asOfMs) {
  return teams.map((t) => snapshotTeamAtDate(t, asOfMs));
}

/** Sport normalization maps matching calculateMiseryIndex / heat map inputs. */
export function computeSportNormalizationForSnapshots(snapshotTeams, asOfMs) {
  const sportMaxDays = {};
  const sportMaxTitles = {};
  for (const team of snapshotTeams) {
    const sport = team.sport || 'Unknown';
    const titles = team.championships?.length || 0;
    sportMaxTitles[sport] = Math.max(sportMaxTitles[sport] || 0, titles);
    if (team.lastChampionship && !team.neverWon) {
      const days = Math.floor((asOfMs - new Date(team.lastChampionship).getTime()) / 86400000);
      if (days >= 0) sportMaxDays[sport] = Math.max(sportMaxDays[sport] || 0, days);
    }
  }
  return { sportMaxDays, sportMaxTitles };
}

/** Slider bounds from championship history (+ padding before earliest title). */
export function miseryPlaybackYearBounds(teams) {
  const cy = new Date().getUTCFullYear();
  let minY = cy;
  let found = false;
  for (const team of teams) {
    for (const c of team.championships || []) {
      const y = new Date(c.date).getUTCFullYear();
      if (!Number.isNaN(y)) {
        found = true;
        minY = Math.min(minY, y);
      }
    }
  }
  if (!found) minY = cy - 40;
  minY = Math.max(1900, minY - 5);
  return { minYear: minY, maxYear: cy };
}
