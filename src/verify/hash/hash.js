const { verifySignature } = require("@govtechsg/open-certificate");

const verifyHash = certificate => ({ valid: verifySignature(certificate) });

module.exports = { verifyHash };
