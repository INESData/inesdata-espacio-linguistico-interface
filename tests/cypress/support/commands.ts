/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

const user = Cypress.env('username');
const pass = Cypress.env('password');

Cypress.Commands.add('login', () => {
  cy.intercept({
    method: 'POST',
    url: `http://keycloak:5443/realms/**/protocol/openid-connect/token`,
  }).as('getToken');
  cy.visit('/');
  cy.get('body').then(($ele) => {
    if ($ele.find('#kc-login').length > 0) {
      cy.get('#username').type(user);
      cy.get('#password').type(pass);
      cy.get('#kc-login').click({ force: true });
    }
  });

  cy.wait('@getToken')
    .its('response')
    .then((response) => {
      if (response && response.body) {
        const accessToken = response.body.access_token;
        cy.setCookie('accessToken', accessToken);
      }
    });
});

Cypress.Commands.add('logout', () => {
  cy.visit('/').then(() => {
    cy.request('/logout');
  });
});

Cypress.Commands.add('clearLocalStorageCache', () => {
  cy.task('log', `@commands - clearing cache`);
  localStorage.clear();
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    logout(): Chainable<void>;
    clearLocalStorageCache(): Chainable<void>;
  }
}
