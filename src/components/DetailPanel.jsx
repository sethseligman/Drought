import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DroughtCounter from './DroughtCounter';
import DroughtBar from './DroughtBar';
import { getLogoCandidates } from '../utils/logoUtils';

function DetailPanel({ team, onClose, maxDays, nowMs }) {
  const logoCandidates = useMemo(() => getLogoCandidates(team || {}), [team]);
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = logoCandidates[logoIndex];
  useEffect(() => {
    setLogoIndex(0);
  }, [team?.id]);
  if (!team) {
    return (
      <aside className="bg-surface border border-white/10 rounded-xl p-4 md:p-5">
        <div className="h-full min-h-[280px] flex items-center justify-center text-center">
          <div>
            <div className="font-display uppercase tracking-[0.1em] text-xl text-text-primary">No Team Selected</div>
            <p className="text-sm text-text-secondary mt-2">Select a team tile to view live drought details and championship history.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-surface border border-white/10 rounded-xl p-4 md:p-5 space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="w-14 h-14 rounded-md bg-black/20 p-1 object-contain" onError={() => setLogoIndex((idx) => idx + 1)} />
          ) : (
            <div className="w-14 h-14 rounded-md bg-black/20 flex items-center justify-center font-display text-xl">{team.abbreviation}</div>
          )}
          <div>
            <h2 className="font-display uppercase tracking-[0.06em] text-2xl text-text-primary leading-none">{team.name}</h2>
            <p className="text-xs text-text-secondary mt-1">{team.league} · {team.city} · Founded {team.founded}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close panel"><X size={20} /></button>
      </header>

      <section>
        <div className="text-[11px] font-display tracking-[0.2em] text-text-secondary uppercase">Live</div>
        <DroughtCounter team={team} nowMs={nowMs} />
      </section>

      <DroughtBar team={team} maxDays={maxDays} nowMs={nowMs} />

      <section>
        <h3 className="text-[11px] font-display tracking-[0.2em] uppercase text-text-secondary">Championship History</h3>
        <ul className="mt-2 max-h-40 overflow-auto space-y-2 text-sm">
          {(team.championships?.length ? team.championships : [{ date: 'N/A', title: 'No championships yet', opponent: '', score: '' }]).map((ring) => (
            <li key={`${team.id}-${ring.date}`} className="bg-white/5 rounded-md p-2">
              <span className="text-text-primary">{ring.date}</span> · <span className="text-text-secondary">{ring.title}</span>
              {ring.opponent ? ` · vs ${ring.opponent}` : ''}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default DetailPanel;
