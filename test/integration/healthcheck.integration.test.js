require("dotenv").config();
const supertest = require("supertest");

const API_ENDPOINT = "https://api-ropsten.opencerts.io";
const request = supertest(API_ENDPOINT);

describe("healthcheck", () => {
  it("should work :)", async () => {
    await request
      .get("/healthcheck")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ message: "OK" });
      });
  }, 20000);
});
