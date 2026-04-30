import { useEffect, useMemo, useState } from 'react';
import { getDrought } from '../utils/dateUtils';
import { getLogoCandidates } from '../utils/logoUtils';

function WallMode({ allLeagues, nowMs }) {
  const [index, setIndex] = useState(0);
  const keys = Object.keys(allLeagues).filter((key) => key !== 'ALL');

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % keys.length), 30000);
    return () => clearInterval(timer);
  }, [keys.length]);

  const leagueKey = keys[index] || 'NFL';
  const teams = allLeagues[leagueKey] || [];
  const ticker = useMemo(() => [...(allLeagues.ALL || [])]
    .sort((a, b) => (getDrought(b.lastChampionship, nowMs)?.days || 999999) - (getDrought(a.lastChampionship, nowMs)?.days || 999999))
    .slice(0, 10), [allLeagues, nowMs]);

  return (
    <div className="h-screen w-screen bg-bg p-3 flex flex-col">
      <div className="font-display text-3xl text-text-primary uppercase tracking-[0.16em] mb-3">{leagueKey} wall mode</div>
      <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2 overflow-hidden">
        {teams.map((team) => {
          const drought = getDrought(team.lastChampionship, nowMs);
          const logoSrc = getLogoCandidates(team)[0];
          return (
            <div key={team.id} className="rounded-md p-2 text-center" style={{ backgroundColor: team.primaryColor }}>
              {logoSrc ? (
                <img src={logoSrc} alt="" className="w-10 h-10 mx-auto object-contain" />
              ) : (
                <div className="w-10 h-10 mx-auto rounded-full bg-black/25 text-white font-display flex items-center justify-center text-sm">{team.abbreviation}</div>
              )}
              <div className="text-white text-xs font-display mt-1">{team.abbreviation}</div>
              <div className="text-white/90 text-[10px] tabular-nums">{drought ? `${String(drought.hours).padStart(2, '0')}:${String(drought.minutes).padStart(2, '0')}:${String(drought.seconds).padStart(2, '0')}` : '---'}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm text-text-primary whitespace-nowrap overflow-hidden">
        <div className="ticker">LONGEST ACTIVE DROUGHTS — {ticker.map((team) => `${team.name} · ${getDrought(team.lastChampionship, nowMs)?.years || 'Never'}Y`).join(' · ')}</div>
      </div>
    </div>
  );
}

export default WallMode;
