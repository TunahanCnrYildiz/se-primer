const cy$ = (name) => `[data-cy="${name}"]`;

// Testler gerçek Gemini çağrısı yapmaz: varsayılan olarak sabit, kuralları çiğnemeyen
// bir tutor yanıtı döner. Tutor'u test eden senaryolar bunu kendi intercept'leriyle ezer.
beforeEach(() => {
  cy.intercept('POST', '/api/tutor', {
    statusCode: 200,
    body: { text: 'İki yolun da riskini nasıl kıyaslarsın?', model: 'stub' },
  }).as('tutor');
});

Cypress.Commands.add('getCy', (name, options) => cy.get(cy$(name), options));

// Giriş ekranında profili seçip oyunu başlatır.
Cypress.Commands.add('startGame', ({ level = 'beginner', role = 'backend', goal = 'architecture' } = {}) => {
  cy.getCy(`level-${level}`).click();
  cy.getCy(`role-${role}`).click();
  cy.getCy(`goal-${goal}`).click();
  cy.getCy('start').should('be.enabled').click();
  cy.getCy('choice-a').should('be.visible');
});

// Bir seçeneği seçer, açıklama panelinin açıldığını doğrular ve devam eder.
Cypress.Commands.add('choose', (letter) => {
  cy.getCy(`choice-${letter.toLowerCase()}`).click();
  cy.getCy('explain-what').should('be.visible');
  cy.getCy('continue').click();
});

Cypress.Commands.add('playPath', (path) => {
  [...path].forEach((letter) => cy.choose(letter));
  cy.getCy('ending').should('be.visible');
});
