module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Match filename
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest", // Ensure JSX and TSX are transformed
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Adjust to match your absolute imports
  },
};
