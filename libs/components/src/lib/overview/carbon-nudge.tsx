import './carbon-nudge.scss';
import { Button, Card } from 'react-bootstrap';
import { CarbonOrdersSummary } from '@energy-broker/shared';
import { Link } from '@tanstack/react-router';

const ESTIMATED_COST_PER_MT = 15;

interface CarbonNudgeProps {
  carbonSummary?: CarbonOrdersSummary
  emissionsMtCo2: number
}

export function CarbonNudge({ carbonSummary, emissionsMtCo2 }: CarbonNudgeProps) {
  if (emissionsMtCo2 <= 0) return null;

  const creditsUsed = carbonSummary?.totalOffsetMtCo2 ?? 0;
  const hasOffsets = creditsUsed > 0;
  const estimatedCost = Math.ceil(emissionsMtCo2 * ESTIMATED_COST_PER_MT);

  const bodyText = hasOffsets
    ? `You've offset ${creditsUsed.toFixed(2)} of ${emissionsMtCo2.toFixed(2)} MT CO₂ this period.`
    : `You emitted ${emissionsMtCo2.toFixed(2)} MT CO₂ this period. Offset it starting at ~$${estimatedCost}.`;

  return (
    <Card className="carbon-nudge">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className="carbon-nudge__icon">
          🌱
        </div>
        <div className="flex-grow-1">
          <div className="carbon-nudge__headline">Offset your carbon footprint</div>
          <div className="carbon-nudge__body">{bodyText}</div>
        </div>
        <Link to="/carbon-credits">
          <Button size="sm" variant="primary">
            Explore offsets
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
