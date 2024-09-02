const { getData, utils } = require("@govtechsg/open-attestation");
const { verify: ocVerify } = require("@govtechsg/opencerts-verify");

const config = require("./config");

const IS_MAINNET =
  config.network === "mainnet" || config.network === "homestead";

function getNetworkName(document) {
  const data = utils.isWrappedV2Document(document)
    ? getData(document)
    : document;

  if (IS_MAINNET && data.network) {
    /* Production Network Whitelist */
    switch (data.network?.chainId) {
      case "137":
        return "matic";
      default:
        break;
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
      default:
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

/**
 * A wrapper of verify to auto-switch between Ethereum and Polygon
 */
export const verify = (document) =>
  ocVerify({ network: getNetworkName(document) })(document);
