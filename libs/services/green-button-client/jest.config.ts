export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/index.ts'],
  coverageDirectory: '../../../coverage/libs/green-button-client',
  coverageReporters: ['lcov', 'text'],
  displayName: 'green-button-client',
  moduleFileExtensions: ['ts', 'js', 'html'],
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
