export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/index.ts'],
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['lcov', 'text'],
  displayName: 'api',
  moduleFileExtensions: ['ts', 'js', 'html'],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
