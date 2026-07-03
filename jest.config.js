const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Jest ne doit PAS ramasser les specs Playwright (e2e/), les worktrees d'agents
  // (.claude/) ni le build (.next/) — sinon `npm test` plante à l'import de
  // @playwright/test et double les suites (audit dette technique, finding H2).
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/.claude/',
    '/.next/',
  ],
}

module.exports = createJestConfig(customJestConfig)
