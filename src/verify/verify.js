const { get } = require("lodash");
const { certificateData } = require("@govtechsg/open-certificate");
const { verifyHash } = require("./hash/hash");
const { verifyAddresses } = require("./identity/identity");
const { verifyIssued } = require("./issued/issued");
const { verifyRevoked } = require("./unrevoked/unrevoked");

const verify = async certificate => {
  const data = certificateData(certificate);
  const targetHash = get(certificate, "signature.targetHash");
  const issuerAddresses = get(data, "issuers", []).map(i => i.certificateStore);

  // Verifies the hash of the certificate
  const hash = verifyHash(certificate);

  // Verifies all the identity of the issuer
  const identity = await verifyAddresses(issuerAddresses);

  // Verifies certificate has been issued on all stores
  const issued = await verifyIssued(issuerAddresses, targetHash);

  // Verifies certificate has not been revoked on any stores
  const revoked = await verifyRevoked(issuerAddresses, targetHash);

  return {
    hash,
    identity,
    issued,
    revoked,
    valid: hash.valid && identity.valid && issued.valid && revoked.valid
  };
};

module.exports = verify