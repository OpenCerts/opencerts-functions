require("dotenv").config();
const supertest = require("supertest");
const ropstenCertificate = require("../fixtures/certificate.json");
const mainnetCertificate = require("../fixtures/certificateMainnetValid.json");

const API_ENDPOINT = process.env.ENDPOINT || "https://api-ropsten.opencerts.io";

console.log(process.env)
const request = supertest(API_ENDPOINT);

describe("email", () => {
  it("should works for valid Ropsten certificate", async () => {
    const apiKey = process.env.EMAIL_INTEGRATION_TEST_API_KEY;
    await request
      .post("/email")
      .set("X-API-KEY", apiKey)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        to: "example@opencerts.io",
        data: ropstenCertificate
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ success: true });
      });
  }, 20000);

  it("should fail for invalid certificate (or on wrong network)", async () => {
    const apiKey = process.env.EMAIL_INTEGRATION_TEST_API_KEY;
    await request
      .post("/email")
      .set("X-API-KEY", apiKey)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        to: "example@opencerts.io",
        data: mainnetCertificate
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .expect(res => {
        expect(res.body).toEqual({ error: "Invalid certificate" });
      });
  }, 20000);

  it("should fail if captcha is invalid and missing api key", async () => {
    await request
      .post("/email")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        to: "example@opencerts.io",
        data: ropstenCertificate,
        captcha: "moo"
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .expect(res => {
        expect(res.body).toEqual({
          error: "Invalid captcha or missing API key"
        });
      });
  }, 20000);

  it("should fail if api key is invalid", async () => {
    await request
      .post("/email")
      .set("X-API-KEY", "oink")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        to: "example@opencerts.io",
        data: ropstenCertificate
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .expect(res => {
        expect(res.body).toEqual({ error: "Invalid API key" });
      });
  }, 20000);
});
