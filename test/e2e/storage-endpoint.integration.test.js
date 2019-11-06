const supertest = require("supertest");
const { put, remove } = require("../../src/storage/s3");
const config = require("../../src/storage/config");
const ropstenDocument = require("../fixtures/certificate.json");

const API_ENDPOINT = "https://api-ropsten.opencerts.io";
const request = supertest(API_ENDPOINT);

const uuidV4Regex = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

const thatIsUploadResponse = {
  id: expect.stringMatching(uuidV4Regex),
  key: expect.any(String),
  type: expect.stringMatching("OPEN-ATTESTATION-TYPE-1")
};

describe("storage endpoint test", () => {
  it("should create document when no placeholder object is there", async done => {
    await request
      .get("/storage/create")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(async (err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual(thatIsUploadResponse);
        return remove({ Bucket: config.bucketName, Key: res.body.id });
      });
  }, 5000);

  it("should create document when placeholder object is there", async done => {
    await request
      .get("/storage/create")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        document: ropstenDocument,
        id: "123"
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(async (err, res) => {
        if (err) return done(err);
        expect(res.id).toEqual("123");
        return remove({ Bucket: config.bucketName, Key: "123" });
      });
  }, 5000);

  it("should throw error forbidden when directly access the document", async () => {
    const document = { foo: "bar" };
    const params = {
      Bucket: config.bucketName,
      Key: "abc",
      Body: JSON.stringify({ document })
    };
    const uploaded = await put(params);

    await supertest(`${uploaded.Location}`)
      .get("/")
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);

    await remove(params);
  }, 5000);

  it("should create a placeholder object", async () => {
    let queueId = "";
    await request
      .get("/storage/queue")
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
      .get(`/storage/get/${queueId}`)
      .set("Content-Type", "application/json")
      .expect(400);

    await supertest(`https://${config.bucketName}.s3.amazonaws.com`)
      .get(`/${queueId}`)
      .set("Content-Type", "application/json")
      .expect(403);

    const params = {
      Bucket: config.bucketName,
      Key: queueId
    };

    await remove(params);
  }, 5000);
});
