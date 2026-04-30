/**
 * Linear lon/lat → overlay percentages using a bbox in `us-map.svg` user space.
 * Pass the bbox measured from path geometry (excluding AK/HI) so dots track the art.
 */

export const GEO = {
  lonW: -124.95,
  lonE: -66.85,
  latN: 49.65,
  latS: 24.18,
};

export const VB = { originX: 192, originY: 9, width: 1028, height: 746 };

/** Reasonable ink box before measurement runs (same map asset). */
export const FALLBACK_CONTIG = {
  minX: 297,
  maxX: 1178,
  minY: 128,
  maxY: 648,
};

export function lonLatToOverlayPercent(contig, lon, lat) {
  let nx = (lon - GEO.lonW) / (GEO.lonE - GEO.lonW);
  let ny = (GEO.latN - lat) / (GEO.latN - GEO.latS);
  nx = Math.min(1, Math.max(0, nx));
  ny = Math.min(1, Math.max(0, ny));

  const sx = contig.minX + nx * (contig.maxX - contig.minX);
  const sy = contig.minY + ny * (contig.maxY - contig.minY);

  const x = ((sx - VB.originX) / VB.width) * 100;
  const y = ((sy - VB.originY) / VB.height) * 100;

  return {
    x: Math.round(Math.min(97, Math.max(3, x)) * 10) / 10,
    y: Math.round(Math.min(96, Math.max(4, y)) * 10) / 10,
  };
}

/** Map asset vs lon/lat — extra overlay % east for specific metros */
const METRO_EAST_NUDGE_PCT = {
  Miami: 5.4,
  'Tampa Bay': 5.4,
  Orlando: 5.4,
  Jacksonville: 5.4,
  Atlanta: 2.7,
};

export function lonLatToMetroOverlayPercent(contig, lon, lat, metroName) {
  const base = lonLatToOverlayPercent(contig, lon, lat);
  const nudge = metroName ? METRO_EAST_NUDGE_PCT[metroName] : 0;
  if (!nudge) return base;
  return {
    x: Math.round(Math.min(97, Math.max(3, base.x + nudge)) * 10) / 10,
    y: base.y,
  };
}

export const METRO_LATLON = {
  'New York': [-73.94, 40.71],
  'Los Angeles': [-118.25, 34.05],
  'Bay Area': [-122.42, 37.77],
  Miami: [-80.19, 25.76],
  'Tampa Bay': [-82.46, 27.95],
  Chicago: [-87.63, 41.88],
  Dallas: [-96.8, 32.78],
  Houston: [-95.37, 29.76],
  Phoenix: [-112.07, 33.45],
  Denver: [-104.99, 39.74],
  Seattle: [-122.33, 47.61],
  Portland: [-122.68, 45.52],
  Atlanta: [-84.39, 33.75],
  Boston: [-71.06, 42.36],
  Philadelphia: [-75.17, 39.95],
  Pittsburgh: [-79.98, 40.44],
  Cleveland: [-81.69, 41.5],
  Detroit: [-83.05, 42.33],
  Minneapolis: [-93.27, 44.98],
  Nashville: [-86.78, 36.17],
  'Kansas City': [-94.58, 39.1],
  'St. Louis': [-90.2, 38.63],
  Cincinnati: [-84.51, 39.1],
  Indianapolis: [-86.16, 39.77],
  Milwaukee: [-87.91, 43.04],
  Buffalo: [-78.88, 42.89],
  Baltimore: [-76.61, 39.29],
  Washington: [-77.04, 38.91],
  Charlotte: [-80.84, 35.23],
  Raleigh: [-78.64, 35.78],
  Orlando: [-81.38, 28.54],
  Jacksonville: [-81.66, 30.33],
  'Las Vegas': [-115.14, 36.17],
  'Salt Lake City': [-111.89, 40.76],
};
