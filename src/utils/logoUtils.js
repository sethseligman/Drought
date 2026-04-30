const ESPN_LEAGUE_PATH = {
  NFL: 'nfl',
  MLB: 'mlb',
  NBA: 'nba',
  NHL: 'nhl',
  WNBA: 'wnba',
};

const CODE_OVERRIDES = {
  'nfl-gb': 'gb',
  'nfl-ne': 'ne',
  'nfl-no': 'no',
  'nfl-sf': 'sf',
  'nfl-tb': 'tb',
  'nfl-nyg': 'nyg',
  'nfl-nyj': 'nyj',
  'nfl-lv': 'lv',
  'nfl-lar': 'lar',
  'nfl-lac': 'lac',
  'nfl-was': 'wsh',
  'mlb-cws': 'chw',
  'mlb-sd': 'sd',
  'mlb-sf': 'sf',
  'mlb-kc': 'kc',
  'mlb-lad': 'lad',
  'mlb-laa': 'laa',
  'mlb-nyy': 'nyy',
  'mlb-nym': 'nym',
  'mlb-tb': 'tb',
  'mlb-wsh': 'wsh',
  'nba-nyk': 'ny',
  'nba-gsw': 'gs',
  'nba-nop': 'no',
  'nba-sas': 'sa',
  'nba-uta': 'utah',
  'nhl-lak': 'la',
  'nhl-tbl': 'tb',
  'nhl-vgk': 'vgk',
};

function getEspnCode(team) {
  const league = (team.league || '').toLowerCase();
  const abbr = (team.abbreviation || '').toLowerCase();
  const key = `${league}-${abbr}`;
  return CODE_OVERRIDES[key] || abbr;
}

export function getLogoCandidates(team) {
  const candidates = [];
  const leaguePath = ESPN_LEAGUE_PATH[team.league];

  if (leaguePath) {
    const code = getEspnCode(team);
    candidates.push(`https://a.espncdn.com/i/teamlogos/${leaguePath}/500/${code}.png`);
  }

  if (team.logoUrlDark) candidates.push(team.logoUrlDark);
  if (team.logoUrl) candidates.push(team.logoUrl);

  return [...new Set(candidates.filter(Boolean))];
}
