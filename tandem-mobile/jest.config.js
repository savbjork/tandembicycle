/** Pure-logic tests only (plain .ts, node env). No React Native rendering. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@store$': '<rootDir>/src/store',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },
};
