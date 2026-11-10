// https://on.cypress.io/api

describe('Pomodoro page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('shows a full pomodoro', () => {
    cy.get('[role="timer"]').should('contain.text', '25:00')
    cy.contains('button', 'Start').should('be.visible')
  })

  it('switches mode via the tabs', () => {
    cy.contains('button', 'Short Break').click()
    cy.get('[role="timer"]').should('contain.text', '05:00')
    cy.contains('button', 'Long Break').click()
    cy.get('[role="timer"]').should('contain.text', '15:00')
  })
})
