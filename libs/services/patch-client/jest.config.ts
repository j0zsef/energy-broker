export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/index.ts'],
  coverageDirectory: '../../../coverage/libs/patch-client',
  coverageReporters: ['lcov', 'text'],
  displayName: 'patch-client',
  moduleFileExtensions: ['ts', 'js', 'html'],
  passWithNoTests: true,
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
