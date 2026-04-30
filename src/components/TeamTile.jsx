import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { getDrought } from '../utils/dateUtils';
import { droughtScore, tileOverlayOpacity } from '../utils/droughtUtils';
import { getLogoCandidates } from '../utils/logoUtils';

function TeamTile({ team, selected, onSelect, maxDays, nowMs }) {
  const logoCandidates = useMemo(() => getLogoCandidates(team), [team]);
  const [logoIndex, setLogoIndex] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoSrc = logoCandidates[logoIndex];
  const score = droughtScore(team, maxDays, nowMs);
  const overlayOpacity = tileOverlayOpacity(score);
  const drought = getDrought(team.lastChampionship, nowMs);
  const aria = `${team.name} ${drought ? `${drought.years} years ${drought.remainingDays} days drought` : 'never won a championship'}`;
  const countNumber = drought ? drought.days.toLocaleString() : 'NEVER';
  const lastTitle = team.championships?.[0];
  const shouldShowTitleLabel =
    lastTitle &&
    !(
      team.league === 'MLB' ||
      team.league === 'NHL' ||
      /stanley cup/i.test(lastTitle.title || '') ||
      /mlb championship/i.test(lastTitle.title || '')
    );

  useEffect(() => {
    setLogoLoaded(false);
  }, [team.id, logoIndex]);

  const onLogoFallback = () => {
    setLogoLoaded(false);
    setLogoIndex((idx) => idx + 1);
  };

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(team)}
      aria-label={aria}
      className={`relative isolate overflow-hidden rounded-sm border h-full w-full ${selected ? 'ring-2 ring-offset-0' : ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(44,44,58,0.95) 0%, rgba(12,12,19,0.98) 100%)',
        borderColor: selected ? '#f0f0f5' : 'rgba(255,255,255,0.28)',
        boxShadow: selected ? '0 0 0 1px rgba(255,255,255,0.45), 0 0 14px rgba(255,255,255,0.2)' : undefined,
      }}
    >
      <div className="relative z-10 h-full grid grid-cols-[36px_1fr] md:grid-cols-[42px_1fr]">
        <div
          className="h-full flex items-center justify-center border-r border-white/20"
          style={{
            background: `linear-gradient(180deg, ${team.primaryColor}66 0%, ${team.primaryColor}33 100%)`,
          }}
        >
          {!logoLoaded && logoSrc ? <div className="tile-logo-loading absolute inset-0" /> : null}
          {logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              loading="lazy"
              className="w-6 h-6 md:w-7 md:h-7 object-contain relative z-10"
              onLoad={() => setLogoLoaded(true)}
              onError={onLogoFallback}
            />
          ) : (
            <div className="font-display text-xs md:text-sm text-white">{team.abbreviation}</div>
          )}
        </div>
        <div className="px-1.5 md:px-2 py-1 text-left overflow-hidden">
          <div className="font-display text-[8px] md:text-[9px] tracking-[0.06em] uppercase text-white/80 leading-[1.05] break-words max-h-[1.9em] overflow-hidden">
            {team.name}
          </div>
          <div className="font-display leading-none text-white tabular-nums whitespace-nowrap">
            <span className="text-[15px] md:text-[18px]">{countNumber}</span>
            {drought ? <span className="text-[9px] md:text-[10px] ml-1 align-middle tracking-[0.08em]">DAYS</span> : null}
          </div>
          <div className="text-[7px] md:text-[8px] uppercase tracking-[0.04em] text-white/80 leading-tight break-words max-h-[2.2em] overflow-hidden">
            {lastTitle
              ? `Last: ${new Date(lastTitle.date).toLocaleDateString()}${shouldShowTitleLabel ? ` (${lastTitle.title})` : ''}`
              : 'Never won title'}
          </div>
        </div>
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      {team.neverWon && <div className="absolute inset-0 never-won-pattern" />}
    </motion.button>
  );
}

export default TeamTile;
