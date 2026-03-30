import './offset-project-cards.scss';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { CarbonProject } from '@energy-broker/shared';

interface OffsetProjectCardsProps {
  onSelect: (projectId: string) => void
  projects: CarbonProject[]
  selectedId: string | null
}

export function OffsetProjectCards({ onSelect, projects, selectedId }: OffsetProjectCardsProps) {
  return (
    <Row className="g-3">
      {projects.map(project => (
        <Col key={project.id} lg={4} md={6}>
          <Card
            className={`project-card${selectedId === project.id ? ' project-card--selected' : ''}`}
            onClick={() => onSelect(project.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(project.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Card.Body>
              <div className="project-card__title">{project.name}</div>
              <Badge bg="secondary" className="project-card__type">{project.type}</Badge>
              <div className="project-card__description">
                {project.description.length > 120
                  ? `${project.description.slice(0, 120)}...`
                  : project.description}
              </div>
              <div className="project-card__country">
                {project.country}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
