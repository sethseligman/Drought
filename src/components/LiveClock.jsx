import { formatWallClock } from '../utils/dateUtils';

function LiveClock({ nowMs }) {
  return <div className="font-display text-sm md:text-base tracking-[0.2em] text-text-secondary uppercase">{formatWallClock(nowMs)}</div>;
}

export default LiveClock;
