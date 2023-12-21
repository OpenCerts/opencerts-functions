const supertest = require("supertest");
const sepoliaDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");
const tamperedDocument = require("../fixtures/tampered-certificate.json");

const API_ENDPOINT =
  process.env.VERIFY_ENDPOINT || "https://api-ropsten.opencerts.io/verify";
const API_TIMEOUT = 15000; // api timeout defined in serverless.yml

const request = supertest(API_ENDPOINT);

describe("verify", () => {
  it(
    "should work for valid Sepolia document",
    async () => {
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
                name: "OpenAttestationDnsTxtIdentityProof",
                type: "ISSUER_IDENTITY",
                data: [
                  {
                    status: "VALID",
                    location: "demo-opencerts.openattestation.com",
                    value: "0x80ca96D2Aab5E1E23876a4D8140Ee1292327a4cd"
                  }
                ],
                status: "VALID"
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
    },
    API_TIMEOUT
  );

  it(
    "should not work for valid document on different network",
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
    },
    API_TIMEOUT
  );

  it(
    "should not work for a tampered document",
    async () => {
      await request
        .post("/")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          document: tamperedDocument
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).toStrictEqual({
            summary: {
              all: false,
              documentStatus: false,
              documentIntegrity: false,
              issuerIdentity: false
            },
            data: [
              {
                type: "DOCUMENT_INTEGRITY",
                name: "OpenAttestationHash",
                data: false,
                reason: {
                  code: 0,
                  codeString: "DOCUMENT_TAMPERED",
                  message: "Document has been tampered with"
                },
                status: "INVALID"
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
                        address: "0x20bc9C354A18C8178A713B9BcCFFaC2152b53990",
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
                status: "INVALID",
                data: [
                  {
                    value: "0x20bc9C354A18C8178A713B9BcCFFaC2152b53990",
                    status: "INVALID",
                    reason: {
                      code: 0,
                      codeString: "INVALID_IDENTITY",
                      message:
                        "Document store 0x20bc9C354A18C8178A713B9BcCFFaC2152b53990 not found in the registry"
                    }
                  }
                ],
                reason: {
                  code: 0,
                  codeString: "INVALID_IDENTITY",
                  message:
                    "Document store 0x20bc9C354A18C8178A713B9BcCFFaC2152b53990 not found in the registry"
                }
              }
            ]
          });
        });
    },
    API_TIMEOUT
  );
});
