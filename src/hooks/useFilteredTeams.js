import { useMemo } from 'react';

function sortByMode(teams, sortMode, nowMs) {
  const items = [...teams];
  const getDays = (team) => (team.lastChampionship ? Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000) : Number.MAX_SAFE_INTEGER);
  switch (sortMode) {
    case 'RECENT':
      return items.sort((a, b) => getDays(a) - getDays(b));
    case 'ALPHA':
      return items.sort((a, b) => a.name.localeCompare(b.name));
    case 'COUNTRY':
      return items.sort((a, b) => (a.country || '').localeCompare(b.country || ''));
    case 'NEVER_TOP':
      return items.sort((a, b) => Number(b.neverWon) - Number(a.neverWon));
    case 'WON_LAST_YEAR':
      return items.sort((a, b) => Number(getDays(a) <= 365) - Number(getDays(b) <= 365));
    case 'LONGEST':
    default:
      return items.sort((a, b) => getDays(b) - getDays(a));
  }
}

export function useFilteredTeams(teams, filters, sortMode, nowMs) {
  return useMemo(() => {
    let out = [...teams];
    if (filters.neverWonOnly) out = out.filter((team) => team.neverWon);
    if (filters.region !== 'ALL') out = out.filter((team) => (team.country || '').toLowerCase().includes(filters.region.toLowerCase()));
    return sortByMode(out, sortMode, nowMs);
  }, [teams, filters, sortMode, nowMs]);
}
