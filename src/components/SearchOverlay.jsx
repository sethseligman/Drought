import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function SearchOverlay({ open, onClose, teams, onPick }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return teams.filter((team) => `${team.name} ${team.league} ${team.abbreviation}`.toLowerCase().includes(q)).slice(0, 40);
  }, [query, teams]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-white/10">
          <Search className="text-text-secondary" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-text-primary" placeholder="Search teams, leagues, countries" />
          <button onClick={onClose} aria-label="Close search"><X className="text-text-secondary" /></button>
        </div>
        <ul className="space-y-2 max-h-[70vh] overflow-auto">
          {results.map((team) => (
            <li key={team.id}>
              <button className="w-full text-left p-3 rounded-md bg-surface hover:bg-surface-elevated border border-white/10" onClick={() => { onPick(team); onClose(); }}>
                <div className="font-display text-lg text-text-primary uppercase tracking-wider">{team.name}</div>
                <div className="text-xs text-text-secondary">{team.league}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchOverlay;
