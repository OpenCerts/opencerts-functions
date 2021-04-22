const supertest = require("supertest");
const ropstenDocument = require("../fixtures/documentWithDocumentStore.json");
const invalidDocument = require("../fixtures/invalidDocument.json");

const API_ENDPOINT =
  process.env.VERIFY_ENDPOINT || "https://api-ropsten.tradetrust.io/verify";
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
                        address: "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca"
                      }
                    ],
                    revocation: [
                      {
                        revoked: false,
                        address: "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca"
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
                    location: "demo-tradetrust.openattestation.com",
                    value: "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca"
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
          document: invalidDocument
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect(res => {
          expect(res.body).toStrictEqual({
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
                status: "SKIPPED",
                type: "DOCUMENT_STATUS",
                name: "OpenAttestationEthereumDocumentStoreStatus",
                reason: {
                  code: 4,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "documentStore" or "certificateStore" property or DOCUMENT_STORE method'
                }
              },
              {
                name: "OpenAttestationDidSignedDocumentStatus",
                type: "DOCUMENT_STATUS",
                data: {
                  issuedOnAll: false,
                  revokedOnAny: false,
                  details: {
                    issuance: [
                      {
                        issued: false,
                        did:
                          "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89",
                        reason: {
                          code: 7,
                          codeString: "WRONG_SIGNATURE",
                          message:
                            "merkle root is not signed correctly by 0xe712878f6e8d5d4f9e87e10da604f9cb564c9a89"
                        }
                      }
                    ],
                    revocation: [
                      {
                        revoked: false
                      }
                    ]
                  }
                },
                status: "INVALID",
                reason: {
                  code: 7,
                  codeString: "WRONG_SIGNATURE",
                  message:
                    "merkle root is not signed correctly by 0xe712878f6e8d5d4f9e87e10da604f9cb564c9a89"
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
              }
            ],
            summary: {
              all: false,
              documentIntegrity: true,
              documentStatus: false,
              issuerIdentity: false
            }
          });
        });
    },
    API_TIMEOUT
  );
});
