const {
  verificationBuilder,
  openAttestationVerifiers
} = require("@govtechsg/oa-verify");
const { registryVerifier } = require("@govtechsg/opencerts-verify");

const config = require("./config");

/**
 * A wrapper of verify to auto-switch between Ethereum and Polygon
 */
export const verify = verificationBuilder(
  [...openAttestationVerifiers, registryVerifier],
  { network: config.network }
);
