require("dotenv").config();
const supertest = require("supertest");
const ropstenDocument = require("../fixtures/documentWithDocumentStore.json");
const invalidDocument = require("../fixtures/invalidDocument.json");

const API_ENDPOINT =
  process.env.EMAIL_ENDPOINT || "https://api-ropsten.tradetrust.io/email";
const API_TIMEOUT = 20000; // api timeout defined in serverless.yml

const request = supertest(API_ENDPOINT);

describe("email", () => {
  it(
    "should works for valid Ropsten certificate",
    async () => {
      const apiKey = process.env.EMAIL_INTEGRATION_TEST_API_KEY;
      await request
        .post("/")
        .set("X-API-KEY", apiKey)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          to: "example@tradetrust.io",
          data: ropstenDocument,
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ success: true });
        });
    },
    API_TIMEOUT
  );

  it(
    "should fail for invalid certificate (or on wrong network)",
    async () => {
      const apiKey = process.env.EMAIL_INTEGRATION_TEST_API_KEY;
      await request
        .post("/")
        .set("X-API-KEY", apiKey)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          to: "example@tradetrust.io",
          data: invalidDocument,
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({ error: "Invalid certificate" });
        });
    },
    API_TIMEOUT
  );

  it(
    "should fail if captcha is invalid and missing api key",
    async () => {
      await request
        .post("/")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          to: "example@tradetrust.io",
          data: ropstenDocument,
          captcha: "moo",
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            error: "Invalid captcha or missing API key",
          });
        });
    },
    API_TIMEOUT
  );

  it(
    "should fail if api key is invalid",
    async () => {
      await request
        .post("/")
        .set("X-API-KEY", "oink")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          to: "example@tradetrust.io",
          data: ropstenDocument,
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({ error: "Invalid API key" });
        });
    },
    API_TIMEOUT
  );
});
