import path from 'path'
import type { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  // https://github.com/facebook/jest/issues/3499#issuecomment-429502378
  rootDir: path.join(__dirname, '..'),
  collectCoverageFrom: ['src/**/*.ts', '!**/*.mock.ts', '!**/*.test.ts'],
  coverageDirectory: './coverage',
  setupFiles: ['<rootDir>/config/jest.setup.ts'],
  prettierPath: null,
}

// eslint-disable-next-line import/no-default-export
export default config
