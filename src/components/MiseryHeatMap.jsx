import { Pause, Play } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FALLBACK_CONTIG,
  METRO_LATLON,
  lonLatToMetroOverlayPercent,
} from '../utils/metroCoords';
import { useClock } from '../context/ClockContext';

/** Strip city / regional prefix so tooltip chips say “Hawks” not “ATL” (shared abbrev). */
const EXTRA_FRANCHISE_PREFIXES = [
  'New York ',
  'Los Angeles ',
  'San Francisco ',
  'Tampa Bay ',
  'Washington ',
  'Golden State ',
  'Minnesota ',
  'Utah ',
  'Indiana ',
  'Carolina ',
  'Florida ',
  'Texas ',
  'Colorado ',
  'Arizona ',
  'New England ',
];

function teamFranchiseLabel(team) {
  const name = team.name?.trim();
  if (!name) return team.abbreviation || 'Team';

  const city = team.city?.trim();
  if (city) {
    const prefix = `${city} `;
    if (name.length > prefix.length && name.toLowerCase().startsWith(prefix.toLowerCase())) {
      return name.slice(prefix.length);
    }
  }

  for (const p of EXTRA_FRANCHISE_PREFIXES) {
    if (name.startsWith(p)) return name.slice(p.length);
  }

  return name;
}

function miseryDotLabelFontPx(dotSizePx, miseryScore) {
  const text = String(Math.round(miseryScore));
  const fit = dotSizePx / (text.length * 0.58 + 0.35);
  return Math.max(6, Math.min(Math.round(fit), 15));
}

function miseryColor(score, maxScore, minScore = 0) {
  const range = maxScore - minScore;
  const t =
    range > 0
      ? Math.min(Math.max((score - minScore) / range, 0), 1)
      : Math.min(score / Math.max(maxScore, 1), 1);
  if (!Number.isFinite(t)) return '#444460';
  const cold = [68, 76, 168];
  const hot = [232, 64, 64];
  const r = Math.round(cold[0] + (hot[0] - cold[0]) * t);
  const g = Math.round(cold[1] + (hot[1] - cold[1]) * t);
  const b = Math.round(cold[2] + (hot[2] - cold[2]) * t);
  return `rgb(${r},${g},${b})`;
}

function daysSinceLastTitle(team, nowMs) {
  if (team.neverWon || !team.lastChampionship) return null;
  const raw = Math.floor((nowMs - new Date(team.lastChampionship).getTime()) / 86400000);
  return raw < 0 ? 0 : raw;
}

function formatSinceTitle(team, nowMs) {
  if (team.neverWon) return 'Never won a championship';
  if (!team.lastChampionship) return 'No championship date on file';
  const days = daysSinceLastTitle(team, nowMs);
  if (days === null) return 'No championship date on file';
  if (days === 0) return 'Won the title very recently';
  if (days === 1) return '1 day since last championship';
  if (days < 730) return `${days.toLocaleString()} days since last championship`;
  const years = Math.floor(days / 365);
  const remDays = days - years * 365;
  return `${years} year${years === 1 ? '' : 's'}, ${remDays.toLocaleString()} days since last championship`;
}

function MiseryMetroTooltip({ city, nowMs }) {
  const sortedTeams = useMemo(() => {
    const teams = [...city.teams];
    teams.sort((a, b) => {
      const da = daysSinceLastTitle(a, nowMs);
      const db = daysSinceLastTitle(b, nowMs);
      const wa = da == null ? Number.MAX_SAFE_INTEGER : da;
      const wb = db == null ? Number.MAX_SAFE_INTEGER : db;
      return wb - wa;
    });
    return teams;
  }, [city, nowMs]);

  return (
    <div
      role="tooltip"
      className="pointer-events-none min-w-[200px] max-w-[min(280px,calc(100vw-2rem))] rounded-lg border border-white/20 bg-[#14141c]/95 px-3 py-2.5 shadow-xl backdrop-blur-sm"
    >
      <div className="font-display text-sm uppercase tracking-[0.08em] text-text-primary border-b border-white/10 pb-1.5 mb-2">
        {city.metro}
      </div>
      <ul className="space-y-1.5 text-[11px] leading-snug text-text-secondary">
        {sortedTeams.map((team) => (
          <li key={team.id}>
            <span
              className={
                team.neverWon
                  ? 'font-medium text-violet-300'
                  : 'font-medium text-text-primary'
              }
            >
              {teamFranchiseLabel(team)}
            </span>
            <span className="text-text-secondary"> · </span>
            <span className={team.neverWon ? 'text-violet-200/85' : ''}>{formatSinceTitle(team, nowMs)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function measureContiguousInkBBox(svgEl) {
  const paths = svgEl.querySelectorAll('path:not(#ak):not(#hi)');
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  paths.forEach((p) => {
    const b = p.getBBox();
    minX = Math.min(minX, b.x);
    maxX = Math.max(maxX, b.x + b.width);
    minY = Math.min(minY, b.y);
    maxY = Math.max(maxY, b.y + b.height);
  });
  if (!Number.isFinite(minX)) return null;
  return { minX, maxX, minY, maxY };
}

function MiseryHeatMap({
  cities,
  subtitle,
  onSelectTeam,
  timelineMs,
  playback,
}) {
  const liveMs = useClock();
  const effectiveMs = timelineMs ?? liveMs;
  const [hoverMetro, setHoverMetro] = useState(null);
  const [pinnedMetro, setPinnedMetro] = useState(null);
  const [svgMarkup, setSvgMarkup] = useState(null);
  const [mapContig, setMapContig] = useState(null);
  const svgHostRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}assets/us-map.svg`)
      .then((r) => r.text())
      .then((txt) => {
        if (!cancelled) setSvgMarkup(txt);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!svgMarkup) return;
    const measure = () => {
      const svg = svgHostRef.current?.querySelector?.('svg');
      if (!svg) return;
      const measured = measureContiguousInkBBox(svg);
      if (measured) setMapContig(measured);
    };
    measure();
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [svgMarkup]);

  const { minScore, maxScore, rankByMetro } = useMemo(() => {
    const sorted = [...cities].sort((a, b) => b.miseryScore - a.miseryScore);
    const map = new Map();
    let r = 0;
    sorted.forEach((c, i) => {
      if (i > 0 && c.miseryScore < sorted[i - 1].miseryScore) r = i;
      map.set(c.metro, r);
    });
    const scores = cities.map((c) => c.miseryScore);
    const min = scores.length ? Math.min(...scores) : 0;
    const max = scores.length ? Math.max(...scores) : 1;
    return { minScore: min, maxScore: Math.max(max, min + 1e-6), rankByMetro: map };
  }, [cities]);

  const contig = mapContig ?? FALLBACK_CONTIG;

  const metroPositions = useMemo(() => {
    const out = {};
    for (const [name, ll] of Object.entries(METRO_LATLON)) {
      out[name] = lonLatToMetroOverlayPercent(contig, ll[0], ll[1], name);
    }
    return out;
  }, [contig]);

  useEffect(() => {
    if (!pinnedMetro) return undefined;
    const onDocPointerDown = (e) => {
      if (e.target.closest('[data-misery-marker-root]')) return;
      setPinnedMetro(null);
    };
    document.addEventListener('pointerdown', onDocPointerDown, true);
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true);
  }, [pinnedMetro]);

  useEffect(() => {
    if (!pinnedMetro) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPinnedMetro(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinnedMetro]);

  const tooltipOpenFor = (metro) => {
    if (pinnedMetro) return pinnedMetro === metro;
    return hoverMetro === metro;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-3 md:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-display text-[11px] tracking-[0.2em] uppercase text-text-secondary">Misery heat map</div>
          <div className="text-xs text-text-secondary mt-1">{subtitle}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-text-secondary">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-8 h-2 rounded bg-[#444460]" /> Low</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-8 h-2 rounded bg-[rgb(232,64,64)]" /> High</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-8 h-2 rounded bg-violet-500/55 ring-1 ring-violet-400/35" /> Never won</span>
        </div>
      </div>

      {playback ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5">
          <span className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary shrink-0">
            Temporal replay
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={playback.onLive}
              className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest border transition-colors ${playback.year === null ? 'bg-white text-black border-white' : 'border-white/15 text-text-secondary hover:text-white hover:border-white/35'}`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={playback.playing ? playback.onPause : playback.onPlay}
              className="p-1.5 rounded-md border border-white/15 text-text-primary hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label={playback.playing ? 'Pause year replay' : 'Play year replay'}
            >
              {playback.playing ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4 pl-0.5" strokeWidth={2} />}
            </button>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[min(100%,240px)]">
            <label className="flex flex-1 items-center gap-2 min-w-[180px]">
              <span className="sr-only">Season through year</span>
              <input
                type="range"
                min={playback.minYear}
                max={playback.maxYear}
                value={playback.year ?? playback.maxYear}
                onChange={(e) => {
                  playback.setYear(Number(e.target.value));
                  playback.onPause();
                }}
                className="flex-1 h-1.5 accent-accent-gold rounded-full bg-white/10 appearance-none cursor-pointer"
              />
              <span className="font-display tabular-nums text-sm text-text-primary min-w-[3rem] text-right shrink-0">
                {playback.year === null ? 'Live' : playback.year}
              </span>
            </label>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-text-secondary leading-relaxed border border-white/10 rounded-lg bg-black/20 px-3 py-2">
        <span className="text-text-primary font-medium">Misery index</span>
        {' '}
        blends each metro’s worst franchise pain with its average team pressure (sport-adjusted: long waits and history weigh heavier), so one brutal drought can register without giant rosters dominating by arithmetic alone.
        If any Big Four team in that metro won within about a year, the metro misery reads as zero (parade-year reset), then it ramps back up as the glow fades. Top markets get a slight rank stretch so the map can show a clear leader instead of a flat red cluster.
        Cities hurting across several sports get a small bump. Larger, hotter dots mean more pressure right now.
        {' '}
        <span className="text-text-primary/90">Temporal replay</span>
        {' '}
        rebuilds each franchise only from titles won through Dec 31 of the chosen year—scrub the slider or hit Play to watch metros swell and shrink as championships land.
      </p>

      <div className="relative w-full rounded-lg border border-white/10 bg-black/40 overflow-visible">
        <div
          ref={svgHostRef}
          className="[&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:rounded-lg [&_svg]:brightness-0 [&_svg]:invert [&_svg]:opacity-[0.45]"
        >
          {svgMarkup ? (
            <div dangerouslySetInnerHTML={{ __html: svgMarkup }} />
          ) : (
            <div
              className="aspect-[1028/746] w-full rounded-lg bg-black/25 pointer-events-none"
              aria-hidden
            />
          )}
        </div>
        <div className="absolute inset-0 overflow-visible pointer-events-none">
        {cities.map((city, idx) => {
          const ll = METRO_LATLON[city.metro];
          const pos = ll ? metroPositions[city.metro] : null;
          if (!pos) return null;
          const linearT = Math.min(
            Math.max((city.miseryScore - minScore) / (maxScore - minScore), 0),
            1,
          );
          const n = cities.length;
          const rank = rankByMetro.get(city.metro) ?? n - 1;
          const rankT = n <= 1 ? 1 : 1 - rank / (n - 1);
          /* Blend score band with rank so the #1 metro reads as the epicenter even when raw points cluster */
          const t = Math.min(0.62 * linearT + 0.38 * rankT ** 1.15, 1);
          const size = Math.round(8 + t ** 1.35 * 52);
          const color = miseryColor(city.miseryScore, maxScore, minScore);
          const ringActive = hoverMetro === city.metro || pinnedMetro === city.metro;
          const glowScale = (0.82 + t ** 1.2 * 1.35).toFixed(3);
          const jitter = `${(idx % 7) * 0.09}s`;
          const open = tooltipOpenFor(city.metro);
          const tipId = `misery-tip-${idx}-${city.metro.replace(/[^a-zA-Z0-9]+/g, '-')}`;
          const miseryLabel = Math.round(city.miseryScore);
          const labelFontPx = miseryDotLabelFontPx(size, city.miseryScore);

          return (
            <div
              key={city.metro}
              data-misery-marker-root
              className={`absolute pointer-events-auto ${open ? 'z-[120]' : 'z-[1]'}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoverMetro(city.metro)}
              onMouseLeave={() => setHoverMetro(null)}
            >
              <div className="relative inline-block">
                {open ? (
                  <div
                    id={tipId}
                    className="absolute bottom-[calc(100%+12px)] left-1/2 z-[80] w-max max-w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 pointer-events-none"
                  >
                    <MiseryMetroTooltip city={city} nowMs={effectiveMs} />
                  </div>
                ) : null}
                <button
                  type="button"
                  className={`misery-marker-glow relative flex items-center justify-center rounded-full border transition-[filter] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${ringActive ? 'border-white z-10 ring-1 ring-white/40' : 'border-black/45'}`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    ['--misery-dot-color']: color,
                    ['--misery-glow-scale']: glowScale,
                    animationDelay: jitter,
                  }}
                  aria-label={`${city.metro}, misery ${miseryLabel}: view drought details`}
                  aria-expanded={open}
                  aria-describedby={open ? tipId : undefined}
                  onClick={() => {
                    if (!globalThis.matchMedia?.('(pointer: coarse)')?.matches) return;
                    setPinnedMetro((prev) => (prev === city.metro ? null : city.metro));
                  }}
                  onFocus={() => setHoverMetro(city.metro)}
                  onBlur={() => setHoverMetro(null)}
                >
                  <span
                    className="font-display font-bold tabular-nums leading-none text-white pointer-events-none select-none px-px"
                    style={{
                      fontSize: `${labelFontPx}px`,
                      textShadow:
                        '0 0 3px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.85), 1px 1px 0 rgba(0,0,0,0.35)',
                    }}
                  >
                    {miseryLabel}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[min(28rem,70vh)] overflow-auto">
        {cities.map((city) => (
          <div key={`list-${city.metro}`} className="rounded-md border border-white/10 bg-black/25 p-2">
            <div className="flex justify-between gap-2">
              <span className="font-display uppercase tracking-[0.06em] text-sm">{city.metro}</span>
              <span className="font-display tabular-nums text-accent-gold">{Math.round(city.miseryScore)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {city.teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  title={team.name}
                  onClick={() => onSelectTeam(team)}
                  className={
                    team.neverWon
                      ? 'text-[10px] px-1.5 py-0.5 rounded tracking-wide bg-violet-950/70 text-violet-200 ring-1 ring-violet-500/35 hover:bg-violet-900/75 capitalize'
                      : 'text-[10px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 tracking-wide text-text-primary capitalize'
                  }
                >
                  {teamFranchiseLabel(team)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MiseryHeatMap;
