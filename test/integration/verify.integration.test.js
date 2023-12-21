const supertest = require("supertest");
const sepoliaDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT = "http://localhost:4000/stg";
const request = supertest(API_ENDPOINT);

describe("verify", () => {
  beforeEach(() => {
    jest.setTimeout(5000);
  });
  it("should works for valid Sepolia document", async () => {
    await request
      .post("/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: sepoliaDocument
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
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
                      address: "0x80ca96D2Aab5E1E23876a4D8140Ee1292327a4cd"
                    }
                  ],
                  revocation: [
                    {
                      revoked: false,
                      address: "0x80ca96D2Aab5E1E23876a4D8140Ee1292327a4cd"
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
              status: "VALID",
              name: "OpenAttestationDnsTxtIdentityProof",
              type: "ISSUER_IDENTITY",
              data: [
                {
                  status: "VALID",
                  location: "demo-opencerts.openattestation.com",
                  value: "0x80ca96D2Aab5E1E23876a4D8140Ee1292327a4cd"
                }
              ]
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
                  value: "0x80ca96D2Aab5E1E23876a4D8140Ee1292327a4cd",
                  name: "SEPOLIA: Government Technology Agency of Singapore (GovTech)",
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
      .expect((res) => {
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
                issuedOnAll: false,
                details: {
                  issuance: [
                    {
                      issued: false,
                      address: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                      reason: {
                        message: "Contract is not found",
                        code: 1,
                        codeString: "DOCUMENT_NOT_ISSUED"
                      }
                    }
                  ]
                }
              },
              reason: {
                message: "Contract is not found",
                code: 1,
                codeString: "DOCUMENT_NOT_ISSUED"
              },
              status: "INVALID"
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
