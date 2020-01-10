const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT = "http://localhost:3000";
const request = supertest(API_ENDPOINT);

describe("verify", () => {
  beforeEach(() => {
    jest.setTimeout(5000);
  });
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
                    address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
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
  });

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
                    error:
                      'call exception (address="0x007d40224f6562461633ccfbaffd359ebb2fc9ba", method="isIssued(bytes32)", args=["0x1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"], version=4.0.41)',
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
  });
});
