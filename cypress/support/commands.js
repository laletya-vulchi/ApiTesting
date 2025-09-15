// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-schema-validator';

Cypress.Commands.add('loginToApplication', () => {
    cy.visit('/login');
    cy.get('[placeholder="Email"]').type(Cypress.env('email'));
    cy.get('[placeholder="Password"]').type(Cypress.env('password'));
    cy.get('[type="submit"]').should('not.be.disabled').click();
});

Cypress.Commands.add('apiRequestWithoutBody', (method, path, needsAuth = false) => {
    if (needsAuth) {
        cy.get('@accessToken').then((accessToken) => {
            return cy.request({
                url: `${Cypress.env('apiUrl')}/${path}`,
                method: method,
                headers: { Authorization: `Token ${accessToken}` },
                failOnStatusCode: false
            });
        });
    } else {
        return cy.request({
            url: `${Cypress.env('apiUrl')}/${path}`,
            method: method,
            failOnStatusCode: false,
        });
    }
});

Cypress.Commands.add('apiRequestWithBody', (method, path, body, needsAuth = false) => {
    if (needsAuth) {
        cy.get('@accessToken').then((accessToken) => {
            return cy.request({
                url: `${Cypress.env('apiUrl')}/${path}`,
                method: method,
                body: body,
                headers: { Authorization: `Token ${accessToken}` },
                failOnStatusCode: false,
            });
        });
    } else {
        return cy.request({
            url: `${Cypress.env('apiUrl')}/${path}`,
            method: method,
            body: body,
            failOnStatusCode: false,
        });
    }
});
