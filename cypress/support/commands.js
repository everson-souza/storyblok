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

Cypress.Commands.add('login', () => {   
    cy.session(Cypress.env('login').email, () => {
      cy.visit('/')
      cy.get('#email').type(Cypress.env('login').email)
      cy.get('#password').type(Cypress.env('login').password)
      cy.get('[data-testid="submit"]').click()
    },
    {
      validate() {
        cy.visit('/#/me/spaces/')
        cy.contains('Spaces')
      },
      cacheAcrossSpecs: true,
    })
})

Cypress.Commands.add('resetDB', () => {   
  cy.log('Aqui')
})