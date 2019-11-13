const ROPSTEN_ADDRESS = "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495";
const MAINNET_ADDRESS = "0x007d40224f6562461633ccfbaffd359ebb2fc9ba";

const getIssuerAddress = network => {
  switch (network.toLowerCase()) {
    case "mainnet":
      return MAINNET_ADDRESS;
    case "ropsten":
    default:
      return ROPSTEN_ADDRESS;
  }
};

const uuidV4Regex = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

const thatIsUploadResponse = {
  id: expect.stringMatching(uuidV4Regex),
  key: expect.any(String),
  type: expect.stringMatching("OPEN-ATTESTATION-TYPE-1")
};

const thatIsRetrievedDocument = {
  document: expect.objectContaining({
    cipherText: expect.any(String),
    iv: expect.any(String),
    tag: expect.any(String)
  })
};

const thatIsAQueueNumber = {
  key: expect.any(String),
  id: expect.stringMatching(uuidV4Regex)
};

const unissuedResponse = ({ network = "ropsten" }) => {
  const documentStoreAddress = getIssuerAddress(network);
  return expect.objectContaining({
    hash: { checksumMatch: true },
    issued: {
      issuedOnAll: false,
      details: [
        {
          address: documentStoreAddress,
          error: expect.stringMatching("exception"),
          issued: false
        }
      ]
    },
    revoked: {
      revokedOnAny: false,
      details: [
        {
          address: documentStoreAddress,
          revoked: false
        }
      ]
    },
    valid: false
  });
};

const successfulResponse = ({ network = "ropsten" }) => {
  const documentStoreAddress = getIssuerAddress(network);
  return expect.objectContaining({
    hash: { checksumMatch: true },
    issued: {
      issuedOnAll: true,
      details: [
        {
          address: documentStoreAddress,
          issued: true
        }
      ]
    },
    revoked: {
      revokedOnAny: false,
      details: [
        {
          address: documentStoreAddress,
          revoked: false
        }
      ]
    },
    valid: true
  });
};

module.exports = {
  successfulResponse,
  unissuedResponse,
  thatIsRetrievedDocument,
  thatIsUploadResponse,
  thatIsAQueueNumber
};
