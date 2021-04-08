const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT =
  process.env.VERIFY_ENDPOINT || "https://api-ropsten.opencerts.io/verify";
const API_TIMEOUT = 15000; // api timeout defined in serverless.yml

const request = supertest(API_ENDPOINT);

describe("verify", () => {
  it(
    "should works for valid Ropsten document",
    async () => {
      await request
        .post("/")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          document: ropstenDocument
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect(res => {
          expect(res.body).toStrictEqual({
            data: [
              {
                data: true,
                name: "OpenAttestationHash",
                status: "VALID",
                type: "DOCUMENT_INTEGRITY"
              },
              {
                name: "OpenAttestationEthereumTokenRegistryStatus",
                reason: {
                  code: 4,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method'
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS"
              },
              {
                data: {
                  details: {
                    issuance: [
                      {
                        address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                        issued: true
                      }
                    ],
                    revocation: [
                      {
                        address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                        revoked: false
                      }
                    ]
                  },
                  issuedOnAll: true,
                  revokedOnAny: false
                },
                name: "OpenAttestationEthereumDocumentStoreStatus",
                status: "VALID",
                type: "DOCUMENT_STATUS"
              },
              {
                name: "OpenAttestationDidSignedDocumentStatus",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not signed by DID directly"
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS"
              },
              {
                name: "OpenAttestationDnsTxtIdentityProof",
                reason: {
                  code: 2,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type'
                },
                status: "SKIPPED",
                type: "ISSUER_IDENTITY"
              },
              {
                name: "OpenAttestationDnsDidIdentityProof",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not issued using DNS-DID"
                },
                status: "SKIPPED",
                type: "ISSUER_IDENTITY"
              },
              {
                data: [
                  {
                    displayCard: false,
                    name: "ROPSTEN: Ngee Ann Polytechnic",
                    status: "VALID",
                    value: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495"
                  }
                ],
                name: "OpencertsRegistryVerifier",
                status: "VALID",
                type: "ISSUER_IDENTITY"
              }
            ],
            summary: {
              all: true,
              documentIntegrity: true,
              documentStatus: true,
              issuerIdentity: true
            }
          });
        });
    },
    API_TIMEOUT
  );

  it(
    "should not works for invalid document",
    async () => {
      await request
        .post("/")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          document: mainnetDocument
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect(res => {
          expect(res.body).toStrictEqual({
            data: [
              {
                data: true,
                name: "OpenAttestationHash",
                status: "VALID",
                type: "DOCUMENT_INTEGRITY"
              },
              {
                data: {
                  details: [
                    {
                      address: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                      reason: {
                        code: 3,
                        codeString: "ETHERS_UNHANDLED_ERROR",
                        message:
                          "Error with smart contract 0x007d40224f6562461633ccfbaffd359ebb2fc9ba: undefined"
                      },
                      issued: false
                    }
                  ],
                  issuedOnAll: false
                },
                reason: {
                  code: 4,
                  codeString: "SKIPPED",
                  message:
                    "Error with smart contract 0x007d40224f6562461633ccfbaffd359ebb2fc9ba: undefined"
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS"
              },
              {
                data: {
                  code: "UNPREDICTABLE_GAS_LIMIT",
                  error: {
                    body:
                      '{"jsonrpc":"2.0","id":42,"error":{"code":-32000,"message":"execution reverted"}}',
                    code: "SERVER_ERROR",
                    error: {
                      code: -32000
                    },
                    reason: "processing response error",
                    requestBody:
                      '{"method":"eth_call","params":[{"to":"0x007d40224f6562461633ccfbaffd359ebb2fc9ba","data":"0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"},"latest"],"id":42,"jsonrpc":"2.0"}',
                    requestMethod: "POST",
                    url:
                      "https://ropsten.infura.io/v3/bb46da3f80e040e8ab73c0a9ff365d18"
                  },
                  method: "call",
                  reason:
                    "cannot estimate gas; transaction may fail or may require manual gas limit",
                  transaction: {
                    data:
                      "0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6",
                    to: "0x007d40224F6562461633ccFBaffd359EbB2FC9Ba"
                  }
                },
                name: "OpenAttestationEthereumDocumentStoreStatus",
                reason: {
                  code: 0,
                  codeString: "UNEXPECTED_ERROR",
                  message:
                    'cannot estimate gas; transaction may fail or may require manual gas limit (error={"reason":"processing response error","code":"SERVER_ERROR","body":"{\\"jsonrpc\\":\\"2.0\\",\\"id\\":42,\\"error\\":{\\"code\\":-32000,\\"message\\":\\"execution reverted\\"}}","error":{"code":-32000},"requestBody":"{\\"method\\":\\"eth_call\\",\\"params\\":[{\\"to\\":\\"0x007d40224f6562461633ccfbaffd359ebb2fc9ba\\",\\"data\\":\\"0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6\\"},\\"latest\\"],\\"id\\":42,\\"jsonrpc\\":\\"2.0\\"}","requestMethod":"POST","url":"https://ropsten.infura.io/v3/bb46da3f80e040e8ab73c0a9ff365d18"}, method="call", transaction={"to":"0x007d40224F6562461633ccFBaffd359EbB2FC9Ba","data":"0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.0.22)'
                },
                status: "ERROR",
                type: "DOCUMENT_STATUS"
              },
              {
                name: "OpenAttestationDidSignedDocumentStatus",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not signed by DID directly"
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS"
              },
              {
                name: "OpenAttestationDnsTxtIdentityProof",
                reason: {
                  code: 2,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type'
                },
                status: "SKIPPED",
                type: "ISSUER_IDENTITY"
              },
              {
                name: "OpenAttestationDnsDidIdentityProof",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not issued using DNS-DID"
                },
                status: "SKIPPED",
                type: "ISSUER_IDENTITY"
              },
              {
                data: [
                  {
                    displayCard: true,
                    email: "info@tech.gov.sg",
                    id: "govtech-registry",
                    logo: "/static/images/GOVTECH_logo.png",
                    name: "Government Technology Agency of Singapore (GovTech)",
                    phone: "+65 6211 2100",
                    status: "VALID",
                    value: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                    website: "https://www.tech.gov.sg"
                  }
                ],
                name: "OpencertsRegistryVerifier",
                status: "VALID",
                type: "ISSUER_IDENTITY"
              }
            ],
            summary: {
              all: false,
              documentIntegrity: true,
              documentStatus: false,
              issuerIdentity: true
            }
          });
        });
    },
    API_TIMEOUT
  );
});
