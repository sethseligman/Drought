import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import LiveClock from './components/LiveClock';
import LeagueNav from './components/LeagueNav';
import Mosaic from './components/Mosaic';
import DetailPanel from './components/DetailPanel';
import SearchOverlay from './components/SearchOverlay';
import SortFilterBar from './components/SortFilterBar';
import WallMode from './components/WallMode';
import MiseryHeatMap from './components/MiseryHeatMap';
import { ClockContext } from './context/ClockContext';
import { FilterContext } from './context/FilterContext';
import { useLiveClock } from './hooks/useLiveClock';
import { useDroughtData } from './hooks/useDroughtData';
import { useFilteredTeams } from './hooks/useFilteredTeams';
import { useWallMode } from './hooks/useWallMode';
import { calculateMiseryIndex } from './utils/miseryUtils';

const LEAGUE_COLORS = {
  ALL: '#c9a84c', NFL: '#013369', MLB: '#002D72', NBA: '#C8102E', NHL: '#ffffff', WNBA: '#FF671F',
  SOCCER: '#2ecc40', F1: '#e8002d', CRICKET: '#003366', RUGBY: '#5f9ea0', OLYMPICS: '#0082c8', OTHER: '#8888aa',
};

function App() {
  const nowMs = useLiveClock();
  const { wallMode } = useWallMode();
  const [activeLeague, setActiveLeague] = useState('ALL');
  const [sortMode, setSortMode] = useState('RECENT');
  const [soccerSubLeague, setSoccerSubLeague] = useState('ALL');
  const [filters, setFilters] = useState({ region: 'ALL', neverWonOnly: false });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState('tiles');

  const { leagues, soccerLeagues, teams } = useDroughtData(activeLeague, soccerSubLeague);
  const filteredTeams = useFilteredTeams(teams, filters, sortMode, nowMs);
  const maxDays = Math.max(...leagues.ALL.map((team) => (team.lastChampionship ? Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000) : 0)), 1);
  const sportMaxDays = useMemo(() => {
    const map = {};
    for (const team of leagues.ALL) {
      const sport = team.sport || 'Unknown';
      const days = team.lastChampionship ? Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000) : 0;
      map[sport] = Math.max(map[sport] || 0, days);
    }
    return map;
  }, [leagues, nowMs]);
  const sportMaxTitles = useMemo(() => {
    const map = {};
    for (const team of leagues.ALL) {
      const sport = team.sport || 'Unknown';
      const titles = team.championships?.length || 0;
      map[sport] = Math.max(map[sport] || 0, titles);
    }
    return map;
  }, [leagues]);

  /** Heat map aggregates every tracked US team by metro (not the active league tab). */
  const heatTeams = useMemo(
    () => leagues.ALL.filter((team) => (team.country || '').toUpperCase().includes('USA')),
    [leagues],
  );

  const heatMapSubtitle = 'United States · every tracked US team by metro';

  const heatSportMaxDays = useMemo(() => {
    const map = {};
    for (const team of heatTeams) {
      const sport = team.sport || 'Unknown';
      const days = team.lastChampionship ? Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000) : 0;
      map[sport] = Math.max(map[sport] || 0, days);
    }
    return map;
  }, [heatTeams, nowMs]);

  const heatSportMaxTitles = useMemo(() => {
    const map = {};
    for (const team of heatTeams) {
      const sport = team.sport || 'Unknown';
      const titles = team.championships?.length || 0;
      map[sport] = Math.max(map[sport] || 0, titles);
    }
    return map;
  }, [heatTeams]);

  const heatMapCities = useMemo(
    () => calculateMiseryIndex(heatTeams, heatSportMaxDays, heatSportMaxTitles, nowMs),
    [heatTeams, heatSportMaxDays, heatSportMaxTitles, nowMs],
  );

  useEffect(() => {
    setSelectedTeam(null);
  }, [activeLeague]);

  useEffect(() => {
    if (activeLeague !== 'SOCCER') {
      setSoccerSubLeague('ALL');
    }
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
            {activeLeague === 'SOCCER' ? (
              <div className="overflow-x-auto no-scrollbar py-2 border-b border-white/10">
                <div className="flex gap-2 min-w-max">
                  {Object.entries(soccerLeagues).map(([id, value]) => {
                    const active = soccerSubLeague === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSoccerSubLeague(id)}
                        className={`px-3 py-1.5 rounded-md text-[11px] tracking-[0.08em] uppercase border ${active ? 'text-white border-white/35 bg-white/5' : 'text-text-secondary border-white/10 hover:text-white'}`}
                      >
                        {id.replaceAll('_', ' ')} <span className="text-[10px] opacity-70">{value.length}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 py-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('tiles')}
                className={`px-3 py-2 rounded-md text-xs uppercase tracking-widest border ${viewMode === 'tiles' ? 'bg-white text-black border-white' : 'bg-surface border-white/10 text-text-secondary hover:text-white'}`}
              >
                Tiles
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heat')}
                className={`px-3 py-2 rounded-md text-xs uppercase tracking-widest border ${viewMode === 'heat' ? 'bg-white text-black border-white' : 'bg-surface border-white/10 text-text-secondary hover:text-white'}`}
              >
                Misery heat map
              </button>
            </div>
            {viewMode === 'tiles' ? (
              <SortFilterBar sortMode={sortMode} setSortMode={setSortMode} filters={filters} setFilters={setFilters} />
            ) : null}
            <div
              className={
                viewMode === 'heat'
                  ? 'pb-6'
                  : 'grid xl:grid-cols-[minmax(0,1fr)_380px] items-start gap-4 pb-6'
              }
            >
              {viewMode === 'heat' ? (
                <MiseryHeatMap
                  cities={heatMapCities}
                  subtitle={heatMapSubtitle}
                  onSelectTeam={(team) => setSelectedTeam(team)}
                />
              ) : (
                <Mosaic teams={filteredTeams} selectedTeam={selectedTeam} onSelect={setSelectedTeam} maxDays={maxDays} sportMaxDays={sportMaxDays} sportMaxTitles={sportMaxTitles} nowMs={nowMs} />
              )}
              {viewMode === 'tiles' ? (
                <div className="hidden xl:block">
                  <DetailPanel team={selectedTeam} onClose={() => setSelectedTeam(null)} maxDays={maxDays} sportMaxDays={sportMaxDays} sportMaxTitles={sportMaxTitles} nowMs={nowMs} />
                </div>
              ) : null}
            </div>
          </div>

          {selectedTeam ? (
            <div
              className={`fixed inset-0 z-50 bg-black/60 p-3 sm:p-6 flex items-end sm:items-center justify-center ${viewMode === 'tiles' ? 'xl:hidden' : ''}`}
              onClick={() => setSelectedTeam(null)}
            >
              <div className="w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(event) => event.stopPropagation()}>
                <DetailPanel team={selectedTeam} onClose={() => setSelectedTeam(null)} maxDays={maxDays} sportMaxDays={sportMaxDays} sportMaxTitles={sportMaxTitles} nowMs={nowMs} />
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
