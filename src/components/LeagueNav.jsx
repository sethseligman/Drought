function LeagueNav({ activeLeague, setActiveLeague, leagues }) {
  return (
    <nav className="overflow-x-auto no-scrollbar border-y border-white/10 py-2">
      <div className="flex gap-2 min-w-max">
        {leagues.map((league) => {
          const active = activeLeague === league.id;
          return (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league.id)}
              className={`px-3 py-2 rounded-md text-xs font-medium tracking-[0.1em] uppercase border ${active ? 'text-white border-white/30' : 'text-text-secondary border-transparent hover:text-white'}`}
              style={active ? { borderBottomColor: league.color, boxShadow: `inset 0 -2px 0 ${league.color}` } : undefined}
            >
              {league.id} <span className="text-[10px] opacity-70">{league.count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default LeagueNav;
