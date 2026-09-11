module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/components/**/*.test.tsx',
    '<rootDir>/tests/integration/**/*.test.ts',
    '<rootDir>/src/domain/**/*.test.ts',
    '<rootDir>/src/application/**/*.test.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.yaml$': '<rootDir>/tests/helpers/yaml-transform.cjs',
  },
  watchman: false,
  clearMocks: true,
  collectCoverageFrom: [
    'src/application/conversation-flow.ts',
    'src/infrastructure/expo/ui/viewport/scrollPolicy.ts',
    'src/infrastructure/expo/ui/viewport/scrollDriver.ts',
  ],
};
