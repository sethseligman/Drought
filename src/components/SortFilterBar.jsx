function SortFilterBar({ sortMode, setSortMode, filters, setFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-text-primary">
        <option value="LONGEST">Longest drought</option>
        <option value="RECENT">Most recent champion</option>
        <option value="ALPHA">Alphabetical A-Z</option>
        <option value="COUNTRY">By country/region</option>
        <option value="NEVER_TOP">Never won first</option>
        <option value="WON_LAST_YEAR">Won within one year</option>
      </select>
      <button onClick={() => setFilters((f) => ({ ...f, neverWonOnly: !f.neverWonOnly }))} className={`px-3 py-2 rounded-md text-xs uppercase tracking-widest ${filters.neverWonOnly ? 'bg-white text-black' : 'bg-surface border border-white/10 text-text-secondary'}`}>Has never won</button>
      <button onClick={() => setFilters((f) => ({ ...f, wonLastFiveYears: !f.wonLastFiveYears }))} className={`px-3 py-2 rounded-md text-xs uppercase tracking-widest ${filters.wonLastFiveYears ? 'bg-white text-black' : 'bg-surface border border-white/10 text-text-secondary'}`}>Won in 5 years</button>
    </div>
  );
}

export default SortFilterBar;
