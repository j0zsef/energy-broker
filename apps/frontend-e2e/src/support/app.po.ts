export const getStatCards = () => cy.get('.stat-card');
export const getChartCard = () => cy.get('.energy-chart-card');
export const getEmptyState = () => cy.get('.card').contains('Welcome to Energy Broker');
export const getConnectionTable = () => cy.get('.energy-connections table');
export const getConnectionRows = () => cy.get('.energy-connections tbody tr');
export const getHeading = (text: string) => cy.contains('h2', text);
export const getLandingHeading = () => cy.contains('h1', 'Take Control of Your Energy');
