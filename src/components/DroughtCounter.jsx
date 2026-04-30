import { getDrought, formatDroughtDisplay } from '../utils/dateUtils';

function DroughtCounter({ team, nowMs, compact = false }) {
  const drought = getDrought(team.lastChampionship, nowMs);
  const display = formatDroughtDisplay(drought);

  return (
    <div>
      {compact || !drought ? (
        <div className={`font-display tabular-nums ${compact ? 'text-base' : 'text-4xl md:text-5xl'} text-text-primary`}>
          {display.primary}
        </div>
      ) : (
        <div className="font-display tabular-nums text-text-primary leading-none">
          <div className="text-4xl md:text-5xl">{drought.years} YEARS</div>
          <div className="text-4xl md:text-5xl mt-1">{drought.remainingDays} DAYS</div>
        </div>
      )}
      {display.secondary && <div className="font-display text-lg text-text-secondary tabular-nums tracking-widest">{display.secondary}</div>}
      {!compact && team.lastChampionship && (
        <div className="mt-2 text-xs text-text-secondary">Since {new Date(team.lastChampionship).toLocaleDateString()} · {team.championships?.[0]?.title || 'Championship'}</div>
      )}
    </div>
  );
}

export default DroughtCounter;
