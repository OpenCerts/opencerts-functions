const supertest = require("supertest");
const { put, remove } = require("../../src/storage/s3");
const config = require("../../src/storage/config");
const ropstenDocument = require("../fixtures/certificate.json");

const {
  thatIsRetrievedDocument,
  thatIsUploadResponse,
  thatIsAQueueNumber
} = require("../utils/matchers");

const API_ENDPOINT = "https://api-ropsten.opencerts.io";
const request = supertest(API_ENDPOINT);

describe("storage endpoint test", () => {
  let documentKey = "";
  afterEach(async () => {
    if (documentKey) {
      await remove({ Bucket: config.bucketName, Key: documentKey });
    }
  });

  beforeEach(() => {
    documentKey = "";
  });

  test("should create a new document when no placeholder object is there", async () => {
    await request
      .post("/storage")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument
      })
      .expect(res => {
        documentKey = res.body.id;
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
      .expect(res => {
        documentKey = res.body.id ? res.body.id : "";
      })
      .expect(400);
  });

  test("should retrieve the document created", async () => {
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

  test("should fail to access placeholder object through api and public url", async () => {
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
      .get(`/storage/${documentKey}`)
      .set("Content-Type", "application/json")
      .expect(400);

    await supertest(`https://${config.bucketName}.s3.amazonaws.com`)
      .get(`/${documentKey}`)
      .set("Content-Type", "application/json")
      .expect(403);
  });

  test("should throw error forbidden when directly access the document", async () => {
    const document = { foo: "bar" };
    documentKey = "123";
    const params = {
      Bucket: config.bucketName,
      Key: documentKey,
      Body: JSON.stringify({ document })
    };

    const uploaded = await put(params);
    await supertest(`${uploaded.Location}`)
      .get("")
      .set("Content-Type", "application/json")
      .expect(403);
  });
});
