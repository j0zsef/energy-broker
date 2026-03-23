export default {
  coverageDirectory: '../../coverage/libs/components',
  displayName: 'components',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'html'],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
