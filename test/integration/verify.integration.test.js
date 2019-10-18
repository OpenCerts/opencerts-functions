const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT = "http://localhost:3000";
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
        expect(res.body).toEqual({
          hash: {
            checksumMatch: true
          },
          issued: {
            issuedOnAll: true,
            details: [
              {
                address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                issued: true
              }
            ]
          },
          revoked: {
            revokedOnAny: false,
            details: [
              {
                address: "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
                revoked: false
              }
            ]
          },
          valid: true
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
        expect(res.body).toEqual({
          hash: {
            checksumMatch: true
          },
          issued: {
            issuedOnAll: false,
            details: [
              {
                address: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                error:
                  'call exception (address="0x007d40224f6562461633ccfbaffd359ebb2fc9ba", method="isIssued(bytes32)", args=["0x1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"], version=4.0.37)',
                issued: false
              }
            ]
          },
          revoked: {
            revokedOnAny: false,
            details: [
              {
                address: "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
                revoked: false
              }
            ]
          },
          valid: false
        });
      });
  }, 5000);
});
