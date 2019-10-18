const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");
const { unissuedResponse, successfulResponse } = require("../utils/matchers");

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
        expect(res.body).toEqual(successfulResponse({ network: "ropsten" }));
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
        expect(res.body).toEqual(unissuedResponse({ network: "mainnet" }));
      });
  }, 5000);
});
