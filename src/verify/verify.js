const {
  openAttestationVerifiers,
  verificationBuilder
} = require("@govtechsg/oa-verify");
const fetch = require("node-fetch");
const openAttestation = require("@govtechsg/open-attestation");

const registryVerifier = {
  test: () => true,
  skip: () => {
    throw new Error("it should never be skipped");
  },
  verify: async document => {
    const issuers = await fetch("https://opencerts.io/static/registry.json")
      .then(res => res.json())
      .then(data => data.issuers);
    const documentData = openAttestation.getData(document);
    if (issuers[documentData.issuers[0].certificateStore]) {
      return {
        status: "VALID",
        type: "ISSUER_IDENTITY",
        name: "OpencertsRegistryVerifier"
      };
    }
    return {
      status: "SKIPPED",
      type: "ISSUER_IDENTITY",
      name: "OpencertsRegistryVerifier",
      message: "Certificate store not found in the registry"
    };
  }
};

module.exports = {
  verify: verificationBuilder([...openAttestationVerifiers, registryVerifier])
};

//
