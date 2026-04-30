import { useMemo } from 'react';
import nfl from '../data/nfl.json';
import mlb from '../data/mlb.json';
import nba from '../data/nba.json';
import nhl from '../data/nhl.json';
import wnba from '../data/wnba.json';
import mls from '../data/mls.json';
import premierLeague from '../data/premier-league.json';
import laLiga from '../data/la-liga.json';
import serieA from '../data/serie-a.json';
import bundesliga from '../data/bundesliga.json';
import ligue1 from '../data/ligue-1.json';
import championsLeague from '../data/champions-league.json';
import fifaWorldCup from '../data/fifa-world-cup.json';
import f1Constructors from '../data/f1-constructors.json';
import f1Drivers from '../data/f1-drivers.json';
import nascar from '../data/nascar.json';
import indycar from '../data/indycar.json';
import cricketWorldCup from '../data/cricket-world-cup.json';
import cricketT20 from '../data/cricket-t20.json';
import cricketIpl from '../data/cricket-ipl.json';
import cricketAshes from '../data/cricket-ashes.json';
import rugbyWorldCup from '../data/rugby-world-cup.json';
import sixNations from '../data/six-nations.json';
import nrl from '../data/nrl.json';
import afl from '../data/afl.json';
import olympicsSummer from '../data/olympics-summer.json';
import olympicsWinter from '../data/olympics-winter.json';
import tennisSlams from '../data/tennis-slams.json';
import golfMajors from '../data/golf-majors.json';
import boxingBelts from '../data/boxing-belts.json';

const leagueData = {
  ALL: [], NFL: nfl, MLB: mlb, NBA: nba, NHL: nhl, WNBA: wnba, MLS: mls,
  SOCCER: [...premierLeague, ...laLiga, ...serieA, ...bundesliga, ...ligue1, ...championsLeague, ...fifaWorldCup],
  F1: [...f1Constructors, ...f1Drivers], CRICKET: [...cricketWorldCup, ...cricketT20, ...cricketIpl, ...cricketAshes],
  RUGBY: [...rugbyWorldCup, ...sixNations, ...nrl, ...afl], OLYMPICS: [...olympicsSummer, ...olympicsWinter],
  OTHER: [...tennisSlams, ...golfMajors, ...boxingBelts, ...nascar, ...indycar],
};
leagueData.ALL = Object.values(leagueData).flat().filter(Boolean);

export function useDroughtData(activeLeague) {
  return useMemo(() => ({
    leagues: leagueData,
    teams: leagueData[activeLeague] ?? leagueData.ALL,
  }), [activeLeague]);
}
