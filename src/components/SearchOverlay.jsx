import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function SearchOverlay({ open, onClose, teams, onPick }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return teams.filter((team) => `${team.name} ${team.league} ${team.abbreviation}`.toLowerCase().includes(q)).slice(0, 40);
  }, [query, teams]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const onSearchKeyDown = (event) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((idx) => Math.min(idx + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        onPick(selected);
        onClose();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-white/10">
          <Search className="text-text-secondary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            className="flex-1 bg-transparent outline-none text-text-primary"
            placeholder="Search teams, leagues, countries"
          />
          <button onClick={onClose} aria-label="Close search"><X className="text-text-secondary" /></button>
        </div>
        <ul className="space-y-2 max-h-[70vh] overflow-auto">
          {results.map((team, index) => (
            <li key={team.id}>
              <button
                className={`w-full text-left p-3 rounded-md border ${index === activeIndex ? 'bg-surface-elevated border-white/35' : 'bg-surface hover:bg-surface-elevated border-white/10'}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => { onPick(team); onClose(); }}
              >
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
