const { getData, validateSchema } = require("@govtechsg/open-attestation");
const {
  verificationBuilder,
  openAttestationVerifiers
} = require("@govtechsg/oa-verify");
const { registryVerifier } = require("@govtechsg/opencerts-verify");

const config = require("./config");

const IS_MAINNET =
  config.network === "mainnet" || config.network === "homestead";

/**
 * A wrapper of verify to auto-switch between Ethereum and Polygon
 */
export const verify = async (document) => {
  if (!validateSchema(document)) {
    // Following current behaviour of from "@govtechsg/opencerts-verify"
    // E.g. await verify({ "bad": "document" }) // returns undefined
    return undefined;
  }

  const _verify = verificationBuilder(
    [...openAttestationVerifiers, registryVerifier],
    {
      network: getNetworkName(document)
    }
  );

  return await _verify(document);
};

function getNetworkName(document) {
  const data = getData(document);

  if (IS_MAINNET) {
    /* Production Network Whitelist */
    switch (data.network?.chainId) {
      case "137":
        return "matic";
    }
  } else {
    /* Non-production Network Whitelist */
    switch (data.network?.chainId) {
      case "80002":
        // return "amoy";
        // FIXME: Setting "amoy" will fail as it's an unsupported network in Ethers v5.7.2
        // Create a custom provider and specify { chainId: 80002, name: "amoy" }
        // https://github.com/OpenCerts/opencerts-website/blob/1de65c66795ec2f416d6c829259e9f9ab1e49e45/src/sagas/certificate.ts#L123
        console.error(`"amoy" is not supported on Ethers v5.7.2 yet`);
        break;
    }
  }

  // A network is specified in the certificate but not in the above whitelist
  if (data.network) {
    console.warn(
      `"${JSON.stringify(
        data.network
      )}" is not a whitelisted network. Reverting back to "${config.network}".`
    );
  }

  return config.network;
}
