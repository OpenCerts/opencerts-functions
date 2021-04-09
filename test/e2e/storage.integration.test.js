const supertest = require("supertest");
const ropstenDocument = require("../fixtures/certificate.json");

const {
  thatIsRetrievedDocument,
  thatIsUploadResponse,
  thatIsAQueueNumber
} = require("../utils/matchers");

const API_ENDPOINT =
  process.env.STORAGE_ENDPOINT || "https://api-ropsten.opencerts.io/storage";
const API_TIMEOUT = 30000; // api timeout defined in serverless.yml

const request = supertest(API_ENDPOINT);

describe("storage endpoint test", () => {
  test(
    "should create a new document when no placeholder object is there",
    async () => {
      await request
        .post("/")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          document: ropstenDocument
        })
        .expect(res => {
          expect(res.body).toEqual(thatIsUploadResponse);
        });
    },
    API_TIMEOUT
  );

  test(
    "should fail when you try to create at a path that hasn't been initialised",
    async () => {
      await request
        .post("/foo")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          document: ropstenDocument
        })
        .expect(400);
    },
    API_TIMEOUT
  );

  test(
    "should retrieve the document created",
    async () => {
      let documentKey;
      await request
        .get("/queue")
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect(res => {
          documentKey = res.body.id;
          expect(res.body).toEqual(thatIsAQueueNumber);
        });

      await request
        .post(`/${documentKey}`)
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
        .get(`/${documentKey}`)
        .set("Content-Type", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(thatIsRetrievedDocument);
        });
    },
    API_TIMEOUT
  );
});
