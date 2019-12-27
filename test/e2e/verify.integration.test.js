const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT = "https://api-ropsten.opencerts.io";
const request = supertest(API_ENDPOINT);

describe("verify", () => {
  it("should works for valid Ropsten document", async () => {
    await request
      .post("/verify")
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
              data: {
                details: [
                  {
                    address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                    error:
                      'contract not deployed (contractAddress="0xc36484efa1544c32ffed2e80a1ea9f0dfc517495", operation="getDeployed", version=4.0.41)',
                    issued: false
                  }
                ],
                issuedOnAll: false
              },
              message: "Certificate has not been issued",
              name: "OpenAttestationEthereumDocumentStoreIssued",
              status: "INVALID",
              type: "DOCUMENT_STATUS"
            },
            {
              message:
                'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
              name: "OpenAttestationEthereumTokenRegistryMinted",
              status: "SKIPPED",
              type: "DOCUMENT_STATUS"
            },
            {
              data: {
                details: [
                  {
                    address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                    error:
                      'contract not deployed (contractAddress="0xc36484efa1544c32ffed2e80a1ea9f0dfc517495", operation="getDeployed", version=4.0.41)',
                    revoked: true
                  }
                ],
                revokedOnAny: true
              },
              message: "Certificate has been revoked",
              name: "OpenAttestationEthereumDocumentStoreRevoked",
              status: "INVALID",
              type: "DOCUMENT_STATUS"
            },
            {
              message:
                'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type',
              name: "OpenAttestationDnsTxt",
              status: "SKIPPED",
              type: "ISSUER_IDENTITY"
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
  }, 5000);

  it("should not works for invalid document", async () => {
    await request
      .post("/verify")
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
                    issued: true
                  }
                ],
                issuedOnAll: true
              },
              name: "OpenAttestationEthereumDocumentStoreIssued",
              status: "VALID",
              type: "DOCUMENT_STATUS"
            },
            {
              message:
                'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
              name: "OpenAttestationEthereumTokenRegistryMinted",
              status: "SKIPPED",
              type: "DOCUMENT_STATUS"
            },
            {
              data: {
                details: [
                  {
                    address: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                    revoked: false
                  }
                ],
                revokedOnAny: false
              },
              name: "OpenAttestationEthereumDocumentStoreRevoked",
              status: "VALID",
              type: "DOCUMENT_STATUS"
            },
            {
              message:
                'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type',
              name: "OpenAttestationDnsTxt",
              status: "SKIPPED",
              type: "ISSUER_IDENTITY"
            }
          ],
          summary: {
            all: false,
            documentIntegrity: true,
            documentStatus: true,
            issuerIdentity: false
          }
        });
      });
  }, 5000);
});
