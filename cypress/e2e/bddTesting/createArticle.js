import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have a valid token', () => {
    cy.visit('https://conduit.bondaracademy.com/');
});

When('I create a new article with a unique title', () => {
    cy.log('happy when');
});

Then('the article should be created successfully', () => {
    cy.log('happy Then');
});
