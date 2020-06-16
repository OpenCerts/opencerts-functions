const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");

const {
  thatIsRetrievedDocument,
  thatIsUploadResponse,
  thatIsAQueueNumber
} = require("../utils/matchers");

const API_ENDPOINT = process.env.ENDPOINT || "https://api-ropsten.opencerts.io";

const request = supertest(API_ENDPOINT);

describe("storage endpoint test", () => {
  jest.setTimeout(10000);
  test("should create a new document when no placeholder object is there", async () => {
    await request
      .post("/storage")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument
      })
      .expect(res => {
        expect(res.body).toEqual(thatIsUploadResponse);
      });
  });

  test("should fail when you try to create at a path that hasn't been initialised", async () => {
    await request
      .post("/storage/foo")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument
      })
      .expect(400);
  });

  test("should retrieve the document created", async () => {
    let documentKey;
    await request
      .get("/storage/queue")
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        documentKey = res.body.id;
        expect(res.body).toEqual(thatIsAQueueNumber);
      });

    await request
      .post(`/storage/${documentKey}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument,
        id: documentKey
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        expect(res.body.id).toEqual(documentKey);
        expect(res.body).toEqual(thatIsUploadResponse);
      });

    await request
      .get(`/storage/${documentKey}`)
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual(thatIsRetrievedDocument);
      });
  });
});
