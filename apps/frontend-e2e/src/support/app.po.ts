export const getHeroCostCard = () => cy.get('.hero-cost-card');
export const getCostTrendChart = () => cy.get('.cost-trend-card');
export const getProviderCards = () => cy.get('.provider-card');
export const getEmptyState = () => cy.get('.card').contains('Welcome to Energy Broker');
export const getConnectionTable = () => cy.get('.energy-connections table');
export const getConnectionRows = () => cy.get('.energy-connections tbody tr');
export const getHeading = (text: string) => cy.contains('h2', text);
export const getLandingHeading = () => cy.contains('h3', 'Your energy, at a glance.');
