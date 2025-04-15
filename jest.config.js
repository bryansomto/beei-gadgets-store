/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require("path");

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Default: maps @/ to root (works for /app, /lib, etc.)
    "^@/lib/(.*)$": "<rootDir>/lib/$1", // Maps @/lib to /lib
    "^@/app/(.*)$": "<rootDir>/app/$1", // Maps @/app to /app
  },
};
