import { Nav } from 'react-bootstrap';
import { TimePeriod } from './use-energy-dashboard';

const PERIODS: { label: string, value: TimePeriod }[] = [
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: 'Year', value: '1y' },
];

interface TimePeriodTabsProps {
  onSelect: (period: TimePeriod) => void
  selectedPeriod: TimePeriod
}

export function TimePeriodTabs({ onSelect, selectedPeriod }: TimePeriodTabsProps) {
  return (
    <Nav
      activeKey={selectedPeriod}
      className="mb-4"
      onSelect={key => key && onSelect(key as TimePeriod)}
      variant="tabs"
    >
      {PERIODS.map(({ label, value }) => (
        <Nav.Item key={value}>
          <Nav.Link eventKey={value}>{label}</Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}
