import { getDrought } from '../utils/dateUtils';

function DroughtBar({ team, maxDays, nowMs }) {
  const days = getDrought(team.lastChampionship, nowMs)?.days ?? maxDays;
  const percent = Math.min((days / Math.max(maxDays, 1)) * 100, 100);

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
