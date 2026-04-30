import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import LiveClock from './components/LiveClock';
import LeagueNav from './components/LeagueNav';
import Mosaic from './components/Mosaic';
import DetailPanel from './components/DetailPanel';
import SearchOverlay from './components/SearchOverlay';
import SortFilterBar from './components/SortFilterBar';
import WallMode from './components/WallMode';
import { ClockContext } from './context/ClockContext';
import { FilterContext } from './context/FilterContext';
import { useLiveClock } from './hooks/useLiveClock';
import { useDroughtData } from './hooks/useDroughtData';
import { useFilteredTeams } from './hooks/useFilteredTeams';
import { useWallMode } from './hooks/useWallMode';

const LEAGUE_COLORS = {
  ALL: '#c9a84c', NFL: '#013369', MLB: '#002D72', NBA: '#C8102E', NHL: '#ffffff', WNBA: '#FF671F', MLS: '#2ecc40',
  SOCCER: '#2ecc40', F1: '#e8002d', CRICKET: '#003366', RUGBY: '#5f9ea0', OLYMPICS: '#0082c8', OTHER: '#8888aa',
};

function App() {
  const nowMs = useLiveClock();
  const { wallMode } = useWallMode();
  const [activeLeague, setActiveLeague] = useState('ALL');
  const [sortMode, setSortMode] = useState('LONGEST');
  const [filters, setFilters] = useState({ region: 'ALL', neverWonOnly: false, wonLastFiveYears: false });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const { leagues, teams } = useDroughtData(activeLeague);
  const filteredTeams = useFilteredTeams(teams, filters, sortMode, nowMs);
  const maxDays = Math.max(...leagues.ALL.map((team) => (team.lastChampionship ? Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000) : 0)), 1);

  useEffect(() => {
    setSelectedTeam(null);
  }, [activeLeague]);

  const leagueList = useMemo(
    () => Object.entries(leagues)
      .filter(([id]) => id !== 'ALL' || true)
      .map(([id, value]) => ({ id, count: value.length, color: LEAGUE_COLORS[id] || '#8888aa' })),
    [leagues],
  );

  if (wallMode) {
    return <WallMode allLeagues={leagues} nowMs={nowMs} />;
  }

  return (
    <ClockContext.Provider value={nowMs}>
      <FilterContext.Provider value={{ filters, setFilters }}>
        <div className="min-h-screen bg-bg text-text-primary">
          <header className="container-app pt-5 pb-4 flex items-center justify-between gap-4">
            <h1 className="font-display text-2xl md:text-4xl tracking-[0.14em] uppercase">The <span className="text-accent-gold">Drought</span></h1>
            <div className="hidden md:block"><LiveClock nowMs={nowMs} /></div>
            <button onClick={() => setSearchOpen(true)} className="p-2 rounded-md border border-white/10 hover:border-white/30" aria-label="Open search"><Search /></button>
          </header>

          <div className="container-app">
            <LeagueNav activeLeague={activeLeague} setActiveLeague={setActiveLeague} leagues={leagueList} />
            <SortFilterBar sortMode={sortMode} setSortMode={setSortMode} filters={filters} setFilters={setFilters} />
            <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] items-start gap-4 pb-6">
              <Mosaic teams={filteredTeams} selectedTeam={selectedTeam} onSelect={setSelectedTeam} maxDays={maxDays} nowMs={nowMs} />
              <div className="hidden xl:block">
                <DetailPanel team={selectedTeam} onClose={() => setSelectedTeam(null)} maxDays={maxDays} nowMs={nowMs} />
              </div>
            </div>
          </div>

          {selectedTeam ? (
            <div
              className="xl:hidden fixed inset-0 z-50 bg-black/60 p-3 sm:p-6 flex items-end sm:items-center justify-center"
              onClick={() => setSelectedTeam(null)}
            >
              <div className="w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(event) => event.stopPropagation()}>
                <DetailPanel team={selectedTeam} onClose={() => setSelectedTeam(null)} maxDays={maxDays} nowMs={nowMs} />
              </div>
            </div>
          ) : null}

          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} teams={leagues.ALL} onPick={(team) => { setSelectedTeam(team); setActiveLeague('ALL'); }} />
        </div>
      </FilterContext.Provider>
    </ClockContext.Provider>
  );
}

export default App;
