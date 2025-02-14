export default {
  coverageDirectory: '../../../coverage/libs/green-button-client',
  displayName: 'green-button-client',
  moduleFileExtensions: ['ts', 'js', 'html'],
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
