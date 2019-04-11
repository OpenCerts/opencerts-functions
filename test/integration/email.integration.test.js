require("dotenv").config();
const supertest = require("supertest");
const ropstenCertificate = require("../fixtures/certificate.json");

const EMAIL_ENDPOINT = "http://localhost:3000";
const request = supertest(EMAIL_ENDPOINT);

test("works", async () => {
  const apiKey = process.env.EMAIL_INTEGRATION_TEST_API_KEY;
  console.log(apiKey);
  await request
    .post("/email")
    .set("X-API-KEY", apiKey)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      to: "yehjxraymond@gmail.com",
      data: ropstenCertificate
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .expect(res => {
      expect(res.body).toEqual({ success: true });
    });
}, 20000);
