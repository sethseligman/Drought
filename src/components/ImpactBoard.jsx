import { getDrought } from '../utils/dateUtils';

function ImpactBoard({ teams, nowMs }) {
  const top = [...teams]
    .sort((a, b) => (getDrought(b.lastChampionship, nowMs)?.days || Number.MAX_SAFE_INTEGER) - (getDrought(a.lastChampionship, nowMs)?.days || Number.MAX_SAFE_INTEGER))
    .slice(0, 8);

  return (
    <section className="mb-4">
      <h2 className="font-display text-2xl md:text-3xl tracking-[0.08em] uppercase text-white">
        Days Since The Last Championship Title
      </h2>
      <div className="mt-2 space-y-1.5">
        {top.map((team) => {
          const drought = getDrought(team.lastChampionship, nowMs);
          const daysText = drought ? `${drought.days.toLocaleString()} DAYS` : 'N/A';
          const lastTitle = team.championships?.[0];
          return (
            <div
              key={team.id}
              className="grid grid-cols-[46px_1fr] md:grid-cols-[56px_1fr] items-stretch rounded-sm overflow-hidden border border-white/20"
              style={{
                background:
                  'linear-gradient(180deg, rgba(40,40,50,0.95) 0%, rgba(10,10,15,0.98) 100%)',
              }}
            >
              <div className="bg-black/35 flex items-center justify-center p-1">
                <img
                  src={team.logoUrl}
                  alt=""
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
              </div>
              <div className="px-2 md:px-3 py-1.5">
                <div className="font-display text-2xl md:text-4xl leading-none tracking-[0.03em] text-white">
                  {daysText}
                </div>
                <div className="font-medium text-[10px] md:text-xs uppercase tracking-[0.08em] text-white/85">
                  {lastTitle
                    ? `Last title: ${new Date(lastTitle.date).toLocaleDateString()} (${lastTitle.title})`
                    : 'Never won championship title'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ImpactBoard;
