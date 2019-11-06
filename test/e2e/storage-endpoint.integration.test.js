const supertest = require("supertest");
const { put } = require("../../src/storage/s3");
const config = require("../../src/storage/config");
const ropstenDocument = require("../fixtures/certificate.json");

const API_ENDPOINT = "https://api-ropsten.opencerts.io";
const request = supertest(API_ENDPOINT);

describe("storage endpoint test", () => {
  it("should throw error forbidden when directly access the document", async () => {
    const document = { foo: "bar" };
    const params = {
      Bucket: config.bucketName,
      Key: "abc",
      Body: JSON.stringify({ document })
    };
    const uploaded = await put(params);

    await request
      .get(`${uploaded.Location}`)
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  }, 5000);

  it("should create a placeholder object", async () => {
    let queueId = "";
    await request
      .post("/storage/queue")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        queueId = res.body.queueNumber;
        expect(res.body).toEqual({
          queueNumber: expect.any(String),
          key: expect.any(String)
        });
      });

    await request
      .get(`/storage/${queueId}`)
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    await request
      .get(`https://${config.bucketName}.s3.amazonaws.com/${queueId}`)
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  }, 5000);
});
