export default {
  coverageDirectory: '../../../coverage/libs/services/api-client',
  displayName: 'api-client',
  moduleFileExtensions: ['ts', 'js', 'html'],
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
