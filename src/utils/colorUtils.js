export function toRGBA(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  const bigint = Number.parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
