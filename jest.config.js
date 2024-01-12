module.exports = {
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    "\\.html": "jest-raw-loader",
    "\\.txt": "jest-raw-loader",
    "\\.subject": "jest-raw-loader",
    "\\.m?jsx?$": "jest-esm-transformer"
  },
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"]
};
