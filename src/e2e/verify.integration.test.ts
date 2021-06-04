import supertest from "supertest";
import ropstenDocument from "./fixtures/documentWithDocumentStore.json";
import invalidDocument from "./fixtures/invalidDocument.json";

const API_ENDPOINT =
  process.env.VERIFY_ENDPOINT || "https://api-ropsten.tradetrust.io/verify";
const request = supertest(API_ENDPOINT);

describe("verify", () => {
  beforeEach(() => {
    jest.setTimeout(15000);
  });
  it("should works for valid Ropsten document", async () => {
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
        expect(res.body).toMatchInlineSnapshot(`
Object {
  "data": Array [
    Object {
      "data": true,
      "name": "OpenAttestationHash",
      "status": "VALID",
      "type": "DOCUMENT_INTEGRITY",
    },
    Object {
      "name": "OpenAttestationEthereumTokenRegistryStatus",
      "reason": Object {
        "code": 4,
        "codeString": "SKIPPED",
        "message": "Document issuers doesn't have \\"tokenRegistry\\" property or TOKEN_REGISTRY method",
      },
      "status": "SKIPPED",
      "type": "DOCUMENT_STATUS",
    },
    Object {
      "data": Object {
        "details": Object {
          "issuance": Array [
            Object {
              "address": "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca",
              "issued": true,
            },
          ],
          "revocation": Array [
            Object {
              "address": "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca",
              "revoked": false,
            },
          ],
        },
        "issuedOnAll": true,
        "revokedOnAny": false,
      },
      "name": "OpenAttestationEthereumDocumentStoreStatus",
      "status": "VALID",
      "type": "DOCUMENT_STATUS",
    },
    Object {
      "name": "OpenAttestationDidSignedDocumentStatus",
      "reason": Object {
        "code": 0,
        "codeString": "SKIPPED",
        "message": "Document was not signed by DID directly",
      },
      "status": "SKIPPED",
      "type": "DOCUMENT_STATUS",
    },
    Object {
      "data": Array [
        Object {
          "location": "demo-tradetrust.openattestation.com",
          "status": "VALID",
          "value": "0x8bA63EAB43342AAc3AdBB4B827b68Cf4aAE5Caca",
        },
      ],
      "name": "OpenAttestationDnsTxtIdentityProof",
      "status": "VALID",
      "type": "ISSUER_IDENTITY",
    },
    Object {
      "name": "OpenAttestationDnsDidIdentityProof",
      "reason": Object {
        "code": 0,
        "codeString": "SKIPPED",
        "message": "Document was not issued using DNS-DID",
      },
      "status": "SKIPPED",
      "type": "ISSUER_IDENTITY",
    },
  ],
  "summary": Object {
    "all": true,
    "documentIntegrity": true,
    "documentStatus": true,
    "issuerIdentity": true,
  },
}
`);
      });
  });

  it("should not work for invalid document", async () => {
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
        expect(res.body).toMatchInlineSnapshot(`
Object {
  "data": Array [
    Object {
      "data": true,
      "name": "OpenAttestationHash",
      "status": "VALID",
      "type": "DOCUMENT_INTEGRITY",
    },
    Object {
      "name": "OpenAttestationEthereumTokenRegistryStatus",
      "reason": Object {
        "code": 4,
        "codeString": "SKIPPED",
        "message": "Document issuers doesn't have \\"tokenRegistry\\" property or TOKEN_REGISTRY method",
      },
      "status": "SKIPPED",
      "type": "DOCUMENT_STATUS",
    },
    Object {
      "name": "OpenAttestationEthereumDocumentStoreStatus",
      "reason": Object {
        "code": 4,
        "codeString": "SKIPPED",
        "message": "Document issuers doesn't have \\"documentStore\\" or \\"certificateStore\\" property or DOCUMENT_STORE method",
      },
      "status": "SKIPPED",
      "type": "DOCUMENT_STATUS",
    },
    Object {
      "name": "OpenAttestationDidSignedDocumentStatus",
      "reason": Object {
        "code": 0,
        "codeString": "SKIPPED",
        "message": "Document was not signed by DID directly",
      },
      "status": "SKIPPED",
      "type": "DOCUMENT_STATUS",
    },
    Object {
      "name": "OpenAttestationDnsTxtIdentityProof",
      "reason": Object {
        "code": 2,
        "codeString": "SKIPPED",
        "message": "Document issuers doesn't have \\"documentStore\\" / \\"tokenRegistry\\" property or doesn't use DNS-TXT type",
      },
      "status": "SKIPPED",
      "type": "ISSUER_IDENTITY",
    },
    Object {
      "name": "OpenAttestationDnsDidIdentityProof",
      "reason": Object {
        "code": 0,
        "codeString": "SKIPPED",
        "message": "Document was not issued using DNS-DID",
      },
      "status": "SKIPPED",
      "type": "ISSUER_IDENTITY",
    },
  ],
  "summary": Object {
    "all": false,
    "documentIntegrity": true,
    "documentStatus": false,
    "issuerIdentity": false,
  },
}
`);
      });
  });
});
