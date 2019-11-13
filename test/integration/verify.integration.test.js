const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");
const mainnetDocument = require("../fixtures/certificateMainnetValid.json");
const { unissuedResponse, successfulResponse } = require("../utils/matchers");

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
        expect(res.body).toEqual(successfulResponse({ network: "ropsten" }));
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
        expect(res.body).toEqual(unissuedResponse({ network: "mainnet" }));
      });
  });
});
