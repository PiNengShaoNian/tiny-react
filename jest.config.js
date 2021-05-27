module.exports = {
  roots: ['<rootDir>/test/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
}
