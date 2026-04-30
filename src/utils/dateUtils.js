export function getDrought(lastChampionshipISO, nowMs = Date.now()) {
  if (!lastChampionshipISO) return null;
  const last = new Date(lastChampionshipISO);
  const diffMs = nowMs - last.getTime();
  const totalDays = Math.max(Math.floor(diffMs / 86400000), 0);
  const years = Math.floor(totalDays / 365.25);
  const remainingDays = Math.floor(totalDays - years * 365.25);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return { years, days: totalDays, remainingDays, hours, minutes, seconds };
}

export function formatDroughtDisplay(drought) {
  if (!drought) return { primary: 'NEVER WON', secondary: '' };
  return {
    primary: `${drought.years}Y ${drought.remainingDays}D`,
    secondary: `${String(drought.hours).padStart(2, '0')}:${String(drought.minutes).padStart(2, '0')}:${String(drought.seconds).padStart(2, '0')}`,
  };
}

export function formatWallClock(nowMs) {
  return new Date(nowMs)
    .toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(',', ' ·')
    .replace(',', ' ·');
}
