module.exports = {
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    "\\.html": "jest-raw-loader",
    "\\.txt": "jest-raw-loader",
    "\\.subject": "jest-raw-loader",
    "\\.m?jsx?$": "jest-esm-transformer"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(axios|@digitalbazaar|base58-universal|base64url-universal|cborg)/)"
  ],
  moduleNameMapper: {
    "@tradetrust-tt/token-registry-v5/contracts":
      "<rootDir>/node_modules/@tradetrust-tt/token-registry-v5/dist/contracts/index.js",
    "@tradetrust-tt/token-registry/contracts":
      "<rootDir>/node_modules/@tradetrust-tt/token-registry/dist/contracts/index.js",
    // @digitalbazaar ESM-only packages — point to actual lib/index.js so transformIgnorePatterns can transpile them
    "@digitalbazaar/bls12-381-multikey":
      "<rootDir>/node_modules/@digitalbazaar/bls12-381-multikey/lib/index.js",
    "@digitalbazaar/bbs-signatures":
      "<rootDir>/node_modules/@digitalbazaar/bbs-signatures/lib/index.js",
    "@digitalbazaar/ecdsa-multikey":
      "<rootDir>/node_modules/@digitalbazaar/ecdsa-multikey/lib/index.js",
    "@digitalbazaar/data-integrity":
      "<rootDir>/node_modules/@digitalbazaar/data-integrity/lib/index.js",
    "@digitalbazaar/ecdsa-sd-2023-cryptosuite":
      "<rootDir>/node_modules/@digitalbazaar/ecdsa-sd-2023-cryptosuite/lib/index.js",
    "@digitalbazaar/bbs-2023-cryptosuite":
      "<rootDir>/node_modules/@digitalbazaar/bbs-2023-cryptosuite/lib/index.js",
    "@digitalbazaar/di-sd-primitives":
      "<rootDir>/node_modules/@digitalbazaar/di-sd-primitives/lib/index.js",
    // ESM-only dependencies of @digitalbazaar packages
    "base58-universal": "<rootDir>/node_modules/base58-universal/lib/index.js",
    "base64url-universal":
      "<rootDir>/node_modules/base64url-universal/lib/index.js"
  }
};
