interface DeltaBadgeProps {
  invertColor?: boolean
  value: number | null
}

export function DeltaBadge({ invertColor, value }: DeltaBadgeProps) {
  if (value === null) return null;

  const isUp = value > 0;
  const arrow = isUp ? '\u25B2' : '\u25BC';
  // For cost/carbon: down is good (green), up is bad (red)
  // invertColor flips this for metrics where up = good
  const isPositive = invertColor ? isUp : !isUp;
  const colorClass = value === 0 ? 'text-body-secondary' : isPositive ? 'text-success' : 'text-danger';

  return (
    <small className={`stat-delta ${colorClass}`}>
      {arrow}
      {' '}
      {Math.abs(value).toFixed(1)}
      %
    </small>
  );
}
