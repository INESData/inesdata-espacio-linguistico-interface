const config = require('./tsconfig.app.json');
const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./tests/unit/__setup__/jest.setup.ts'],
  testPathIgnorePatterns: ['node_modules/'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub',
  },
  verbose: true,
  // help with referencing source code inside tests
  roots: ['<rootDir>/tests/unit'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: pathsToModuleNameMapper(config.compilerOptions.paths),
  // ignore setup and mocks in coverage reports
  coveragePathIgnorePatterns: ['<rootDir>/tests/unit/__(.*)__', '<rootDir>/node_modules/'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!vuetify)'],
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};
