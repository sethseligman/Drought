import { motion } from 'framer-motion';
import TeamTile from './TeamTile';

function Mosaic({ teams, selectedTeam, onSelect, maxDays, nowMs }) {
  return (
    <motion.div layout className="grid grid-cols-4 md:grid-cols-8 2xl:grid-cols-12 gap-1.5 content-start self-start">
      {teams.map((team) => (
        <div key={team.id} className="h-[72px] md:h-[78px]">
          <TeamTile
            team={team}
            selected={selectedTeam?.id === team.id}
            onSelect={onSelect}
            maxDays={maxDays}
            nowMs={nowMs}
          />
        </div>
      ))}
    </motion.div>
  );
}

export default Mosaic;
