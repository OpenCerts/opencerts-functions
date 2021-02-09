const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT = "http://localhost:4000/stg";
const request = supertest(API_ENDPOINT);

describe("verify", () => {
  beforeEach(() => {
    jest.setTimeout(5000);
  });
  it("should works for valid Ropsten document", async () => {
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
          summary: {
            all: true,
            documentStatus: true,
            documentIntegrity: true,
            issuerIdentity: true
          },
          data: [
            {
              type: "DOCUMENT_INTEGRITY",
              name: "OpenAttestationHash",
              data: true,
              status: "VALID"
            },
            {
              status: "SKIPPED",
              type: "DOCUMENT_STATUS",
              name: "OpenAttestationEthereumTokenRegistryStatus",
              reason: {
                code: 4,
                codeString: "SKIPPED",
                message:
                  'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method'
              }
            },
            {
              name: "OpenAttestationEthereumDocumentStoreStatus",
              type: "DOCUMENT_STATUS",
              data: {
                issuedOnAll: true,
                revokedOnAny: false,
                details: {
                  issuance: [
                    {
                      issued: true,
                      address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495"
                    }
                  ],
                  revocation: [
                    {
                      revoked: false,
                      address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495"
                    }
                  ]
                }
              },
              status: "VALID"
            },
            {
              status: "SKIPPED",
              type: "DOCUMENT_STATUS",
              name: "OpenAttestationDidSignedDocumentStatus",
              reason: {
                code: 0,
                codeString: "SKIPPED",
                message: "Document was not signed by DID directly"
              }
            },
            {
              status: "SKIPPED",
              type: "ISSUER_IDENTITY",
              name: "OpenAttestationDnsTxtIdentityProof",
              reason: {
                code: 2,
                codeString: "SKIPPED",
                message:
                  'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type'
              }
            },
            {
              status: "SKIPPED",
              type: "ISSUER_IDENTITY",
              name: "OpenAttestationDnsDidIdentityProof",
              reason: {
                code: 0,
                codeString: "SKIPPED",
                message: "Document was not issued using DNS-DID"
              }
            },
            {
              type: "ISSUER_IDENTITY",
              name: "OpencertsRegistryVerifier",
              status: "VALID",
              data: [
                {
                  status: "VALID",
                  value: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                  name: "ROPSTEN: Ngee Ann Polytechnic",
                  displayCard: false
                }
              ]
            }
          ]
        });
      });
  });

  it("should not works for invalid document", async () => {
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
          summary: {
            all: false,
            documentStatus: false,
            documentIntegrity: true,
            issuerIdentity: true
          },
          data: [
            {
              type: "DOCUMENT_INTEGRITY",
              name: "OpenAttestationHash",
              data: true,
              status: "VALID"
            },
            {
              status: "SKIPPED",
              type: "DOCUMENT_STATUS",
              name: "OpenAttestationEthereumTokenRegistryStatus",
              reason: {
                code: 4,
                codeString: "SKIPPED",
                message:
                  'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method'
              }
            },
            {
              name: "OpenAttestationEthereumDocumentStoreStatus",
              type: "DOCUMENT_STATUS",
              data: {
                reason:
                  "cannot estimate gas; transaction may fail or may require manual gas limit",
                code: "UNPREDICTABLE_GAS_LIMIT",
                error: {
                  reason: "processing response error",
                  code: "SERVER_ERROR",
                  body:
                    '{"jsonrpc":"2.0","id":42,"error":{"code":-32000,"message":"execution reverted"}}',
                  error: {
                    code: -32000
                  },
                  requestBody:
                    '{"method":"eth_call","params":[{"to":"0x007d40224f6562461633ccfbaffd359ebb2fc9ba","data":"0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"},"latest"],"id":42,"jsonrpc":"2.0"}',
                  requestMethod: "POST",
                  url:
                    "https://ropsten.infura.io/v3/bb46da3f80e040e8ab73c0a9ff365d18"
                },
                method: "call",
                transaction: {
                  to: "0x007d40224F6562461633ccFBaffd359EbB2FC9Ba",
                  data:
                    "0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
                }
              },
              reason: {
                message:
                  'cannot estimate gas; transaction may fail or may require manual gas limit (error={"reason":"processing response error","code":"SERVER_ERROR","body":"{\\"jsonrpc\\":\\"2.0\\",\\"id\\":42,\\"error\\":{\\"code\\":-32000,\\"message\\":\\"execution reverted\\"}}","error":{"code":-32000},"requestBody":"{\\"method\\":\\"eth_call\\",\\"params\\":[{\\"to\\":\\"0x007d40224f6562461633ccfbaffd359ebb2fc9ba\\",\\"data\\":\\"0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6\\"},\\"latest\\"],\\"id\\":42,\\"jsonrpc\\":\\"2.0\\"}","requestMethod":"POST","url":"https://ropsten.infura.io/v3/bb46da3f80e040e8ab73c0a9ff365d18"}, method="call", transaction={"to":"0x007d40224F6562461633ccFBaffd359EbB2FC9Ba","data":"0x163aa6311a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.0.22)',
                code: 0,
                codeString: "UNEXPECTED_ERROR"
              },
              status: "ERROR"
            },
            {
              status: "SKIPPED",
              type: "DOCUMENT_STATUS",
              name: "OpenAttestationDidSignedDocumentStatus",
              reason: {
                code: 0,
                codeString: "SKIPPED",
                message: "Document was not signed by DID directly"
              }
            },
            {
              status: "SKIPPED",
              type: "ISSUER_IDENTITY",
              name: "OpenAttestationDnsTxtIdentityProof",
              reason: {
                code: 2,
                codeString: "SKIPPED",
                message:
                  'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type'
              }
            },
            {
              status: "SKIPPED",
              type: "ISSUER_IDENTITY",
              name: "OpenAttestationDnsDidIdentityProof",
              reason: {
                code: 0,
                codeString: "SKIPPED",
                message: "Document was not issued using DNS-DID"
              }
            },
            {
              type: "ISSUER_IDENTITY",
              name: "OpencertsRegistryVerifier",
              status: "VALID",
              data: [
                {
                  status: "VALID",
                  value: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                  name: "Government Technology Agency of Singapore (GovTech)",
                  displayCard: true,
                  website: "https://www.tech.gov.sg",
                  email: "info@tech.gov.sg",
                  phone: "+65 6211 2100",
                  logo: "/static/images/GOVTECH_logo.png",
                  id: "govtech-registry"
                }
              ]
            }
          ]
        });
      });
  });
});
