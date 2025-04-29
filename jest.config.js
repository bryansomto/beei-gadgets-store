/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
          },
          keepClassNames: true,
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!mongoose|mongodb-memory-server)"],
};
