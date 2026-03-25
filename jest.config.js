module.exports = {
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    "\\.(html|txt|subject)$": "<rootDir>/jest-raw-loader.js"
  },
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "html", "txt", "subject"]
};
