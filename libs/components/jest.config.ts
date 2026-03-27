export default {
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.spec.ts', '!src/**/*.spec.tsx', '!src/**/index.ts'],
  coverageDirectory: '../../coverage/libs/components',
  coverageReporters: ['lcov', 'text'],
  displayName: 'components',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'html'],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
