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
          document: ropstenDocument,
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).toStrictEqual({
            data: [
              {
                type: "DOCUMENT_INTEGRITY",
                name: "OpenAttestationHash",
                data: true,
                status: "VALID",
              },
              {
                status: "SKIPPED",
                type: "DOCUMENT_STATUS",
                name: "OpenAttestationEthereumTokenRegistryStatus",
                reason: {
                  code: 4,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
                },
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
                        address: "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca",
                      },
                    ],
                    revocation: [
                      {
                        revoked: false,
                        address: "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca",
                      },
                    ],
                  },
                },
                status: "VALID",
              },
              {
                status: "SKIPPED",
                type: "DOCUMENT_STATUS",
                name: "OpenAttestationDidSignedDocumentStatus",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not signed by DID directly",
                },
              },
              {
                name: "OpenAttestationDnsTxtIdentityProof",
                type: "ISSUER_IDENTITY",
                data: [
                  {
                    status: "VALID",
                    location: "demo-tradetrust.openattestation.com",
                    value: "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca",
                  },
                ],
                status: "VALID",
              },
              {
                status: "SKIPPED",
                type: "ISSUER_IDENTITY",
                name: "OpenAttestationDnsDidIdentityProof",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not issued using DNS-DID",
                },
              },
            ],
            summary: {
              all: true,
              documentIntegrity: true,
              documentStatus: true,
              issuerIdentity: true,
            },
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
          document: invalidDocument,
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).toStrictEqual({
            data: [
              {
                type: "DOCUMENT_INTEGRITY",
                name: "OpenAttestationHash",
                data: true,
                status: "VALID",
              },
              {
                name: "OpenAttestationEthereumTokenRegistryStatus",
                reason: {
                  code: 4,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS",
              },
              {
                name: "OpenAttestationEthereumDocumentStoreStatus",
                reason: {
                  code: 4,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "documentStore" or "certificateStore" property or DOCUMENT_STORE method',
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS",
              },
              {
                name: "OpenAttestationDidSignedDocumentStatus",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not signed by DID directly",
                },
                status: "SKIPPED",
                type: "DOCUMENT_STATUS",
              },
              {
                name: "OpenAttestationDnsTxtIdentityProof",
                reason: {
                  code: 2,
                  codeString: "SKIPPED",
                  message:
                    'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type',
                },
                status: "SKIPPED",
                type: "ISSUER_IDENTITY",
              },
              {
                name: "OpenAttestationDnsDidIdentityProof",
                reason: {
                  code: 0,
                  codeString: "SKIPPED",
                  message: "Document was not issued using DNS-DID",
                },
                status: "SKIPPED",
                type: "ISSUER_IDENTITY",
              },
            ],
            summary: {
              all: false,
              documentIntegrity: true,
              documentStatus: false,
              issuerIdentity: false,
            },
          });
        });
    },
    API_TIMEOUT
  );
});
