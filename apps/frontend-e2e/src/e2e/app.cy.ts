import {
  getChartCard,
  getConnectionRows,
  getConnectionTable,
  getEmptyState,
  getHeading,
  getLandingHeading,
  getStatCards,
} from '../support/app.po';

const API = 'http://localhost:9400';

const mockConnection = {
  authToken: 'tok',
  createdAt: '2025-01-15T00:00:00Z',
  energyProvider: {
    fullName: 'Acme Electric Co',
    id: 1,
    name: 'acme',
    type: 'electrical',
  },
  energyProviderId: 1,
  expiresAt: '2099-12-31T00:00:00Z',
  id: 1,
  refreshToken: 'ref',
  resourceUri: 'https://api.example.com',
  userId: 'user-123',
};

const mockUsagePoints = [
  { meterId: '1', title: 'Residential Meter' },
];

const mockSummaries = [
  {
    content: {
      ElectricPowerUsageSummary: {
        billingPeriod: { duration: 2678400, start: 1735689600 },
        billLastPeriod: 9245,
        overallConsumptionLastPeriod: { powerOfTenMultiplier: 0, uom: 72, value: 680000 },
      },
    },
    published: '2025-03-01T00:00:00Z',
    title: 'January 2025',
  },
  {
    content: {
      ElectricPowerUsageSummary: {
        billingPeriod: { duration: 2419200, start: 1738368000 },
        billLastPeriod: 7830,
        overallConsumptionLastPeriod: { powerOfTenMultiplier: 0, uom: 72, value: 520000 },
      },
    },
    published: '2025-03-01T00:00:00Z',
    title: 'February 2025',
  },
  {
    content: {
      ElectricPowerUsageSummary: {
        billingPeriod: { duration: 2678400, start: 1740787200 },
        billLastPeriod: 8520,
        overallConsumptionLastPeriod: { powerOfTenMultiplier: 0, uom: 72, value: 610000 },
      },
    },
    published: '2025-03-01T00:00:00Z',
    title: 'March 2025',
  },
];

describe('Landing page (unauthenticated)', () => {
  it('shows the landing page when not logged in', () => {
    cy.intercept('GET', `${API}/v1/auth/me`, { statusCode: 401 });
    cy.visit('/');
    getLandingHeading().should('be.visible');
    cy.contains('button', 'Get Started').should('be.visible');
  });
});

describe('Overview (authenticated)', () => {
  it('shows empty state when user has no connections', () => {
    cy.mockAuth();
    cy.mockConnections([]);
    cy.visit('/');
    cy.wait('@authMe');
    cy.wait('@connections');
    getEmptyState().should('be.visible');
  });

  it('renders stats cards and charts with data', () => {
    cy.mockAuth();
    cy.mockConnections([mockConnection]);
    cy.intercept('GET', `${API}/v1/connections/1/usage`, {
      body: mockUsagePoints,
      statusCode: 200,
    }).as('usage');
    cy.intercept('GET', `${API}/v1/connections/1/summary/meters/1*`, {
      body: mockSummaries,
      statusCode: 200,
    }).as('summary');

    cy.visit('/');
    cy.wait('@authMe');
    cy.wait('@connections');
    cy.wait('@usage');
    cy.wait('@summary');

    getStatCards().should('have.length', 3);
    getChartCard().should('have.length.at.least', 1);
  });
});

describe('Connections page', () => {
  beforeEach(() => {
    cy.mockAuth();
  });

  it('renders the connection list', () => {
    cy.mockConnections([mockConnection]);
    cy.visit('/connections');
    cy.wait('@authMe');
    cy.wait('@connections');

    getHeading('Energy Connections').should('be.visible');
    getConnectionTable().should('be.visible');
    getConnectionRows().should('have.length', 1);
    cy.contains('td', 'acme').should('be.visible');
  });

  it('shows empty state when no connections exist', () => {
    cy.mockConnections([]);
    cy.visit('/connections');
    cy.wait('@authMe');
    cy.wait('@connections');

    cy.contains('No energy connections found').should('be.visible');
  });
});
