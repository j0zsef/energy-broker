/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockAuth(): void
      mockConnections(connections: unknown[]): void
      mockProviders(providers: unknown[]): void
    }
  }
}

const API = 'http://localhost:9400';

Cypress.Commands.add('mockAuth', () => {
  cy.intercept('GET', `${API}/v1/auth/me`, {
    body: {
      email: 'test@example.com',
      name: 'Test User',
      userId: 'user-123',
    },
    statusCode: 200,
  }).as('authMe');
});

Cypress.Commands.add('mockConnections', (connections: unknown[]) => {
  cy.intercept('GET', `${API}/v1/energy-providers/connections`, {
    body: connections,
    statusCode: 200,
  }).as('connections');
});

Cypress.Commands.add('mockProviders', (providers: unknown[]) => {
  cy.intercept('GET', `${API}/v1/energy-providers`, {
    body: providers,
    statusCode: 200,
  }).as('providers');
});
