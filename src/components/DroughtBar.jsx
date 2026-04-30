import { droughtScore } from '../utils/droughtUtils';

function DroughtBar({ team, maxDays, sportMaxDays, sportMaxTitles, nowMs }) {
  const score = droughtScore(
    team,
    sportMaxDays?.[team.sport] || maxDays,
    sportMaxTitles?.[team.sport] || 1,
    nowMs,
  );
  const percent = Math.min(score * 100, 100);

  return (
    <div className="space-y-2">
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full" style={{ width: `${percent}%`, backgroundColor: team.primaryColor }} />
      </div>
      <div className="text-xs text-text-secondary uppercase tracking-[0.14em]">Drought intensity {Math.round(percent)}%</div>
    </div>
  );
}

export default DroughtBar;
