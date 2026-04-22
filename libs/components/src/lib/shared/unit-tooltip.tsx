import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const UNIT_DESCRIPTIONS: Record<string, string> = {
  'MT': 'Metric tons — a unit of weight equal to 1,000 kg. Used here to measure CO\u2082 emissions.',
  'MT CO2': 'Metric tons of CO\u2082 — the standard unit for measuring carbon emissions and offsets.',
  'kWh': 'Kilowatt-hours — a measure of energy consumption. 1 kWh powers a 1,000-watt appliance for one hour.',
};

interface UnitTooltipProps {
  className?: string
  unit: string
}

export function UnitTooltip({ className, unit }: UnitTooltipProps) {
  const description = UNIT_DESCRIPTIONS[unit];

  if (!description) {
    return <span className={className}>{unit}</span>;
  }

  return (
    <OverlayTrigger
      overlay={<Tooltip id={`unit-tip-${unit}`}>{description}</Tooltip>}
      placement="top"
    >
      <span className={className} style={{ borderBottom: '1px dotted currentColor', cursor: 'help' }}>
        {unit}
      </span>
    </OverlayTrigger>
  );
}
