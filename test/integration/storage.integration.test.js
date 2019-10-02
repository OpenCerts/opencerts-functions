jest.mock("@govtechsg/oa-verify"); // mocked because we'll test this part in e2e

const uuid = require("uuid/v4");
const verify = require("@govtechsg/oa-verify");
const { decryptString } = require("@govtechsg/opencerts-encryption");
const {
  uploadDocument,
  getDocument,
  getQueueNumber
} = require("../../src/storage/documentService");

const uuidV4Regex = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

const thatIsUploadResponse = {
  id: expect.stringMatching(uuidV4Regex),
  key: expect.any(String),
  ttl: expect.any(Number),
  type: expect.stringMatching("OPEN-ATTESTATION-TYPE-1")
};

const thatIsRetrievedDocument = {
  created: expect.any(Number),
  document: expect.objectContaining({
    cipherText: expect.any(String),
    iv: expect.any(String),
    tag: expect.any(String)
  }),
  id: expect.stringMatching(uuidV4Regex),
  ttl: expect.any(Number)
};

describe("uploadDocument", () => {
  beforeEach(() => {
    verify.mockResolvedValue({ valid: true });
  });

  test("should work without queue number or ttl", async () => {
    const document = { foo: "bar" };
    const uploaded = await uploadDocument(document);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults).toMatchObject(thatIsRetrievedDocument);
  });

  test("should work with queue number", async () => {
    const { id: queueNumber } = await getQueueNumber();
    const document = { foo: "bar" };
    const uploaded = await uploadDocument(document, queueNumber);

    expect(uploaded).toMatchObject(thatIsUploadResponse);

    const getResults = await getDocument(uploaded.id);

    expect(getResults).toMatchObject(thatIsRetrievedDocument);
    expect(getResults.id).toEqual(queueNumber);
  });

  test("should work with queue number and ttl", async () => {
    const { id: queueNumber } = await getQueueNumber();
    const document = { foo: "bar" };
    const ttl = 60 * 60;
    const uploaded = await uploadDocument(document, queueNumber, ttl);

    expect(uploaded).toMatchObject(thatIsUploadResponse);

    const getResults = await getDocument(uploaded.id);

    expect(getResults).toMatchObject(thatIsRetrievedDocument);
    expect(getResults.id).toEqual(queueNumber);
  });

  test("should throw error when you try to upload to a uuid that is not queue number", async () => {
    const document = { foo: "bar" };

    const uploaded = uploadDocument(document, uuid());

    await expect(uploaded).rejects.toThrow("No Document Found");
  });

  test("should throw error when you try to upload to a uuid that is not queue number but exist in db", async () => {
    const document = { foo: "bar" };
    const { id: queueNumber } = await getQueueNumber();
    const uploaded = await uploadDocument(document, queueNumber);
    expect(uploaded).toMatchObject(thatIsUploadResponse);

    const uploadedRepeat = uploadDocument(document, queueNumber);
    await expect(uploadedRepeat).rejects.toThrow(
      "The conditional request failed"
    );
  });

  test("should throw error with invalid ttls", async () => {
    const document = { foo: "bar" };

    const uploaded = uploadDocument(document, undefined, 100000000000);
    expect(uploaded).rejects.toThrow("TTL exceeds maximum of 30 days");
  });

  test("should throw error when document verification failed", async () => {
    const document = { foo: "bar" };
    verify.mockResolvedValueOnce({ valid: false });
    const uploaded = uploadDocument(document);
    expect(uploaded).rejects.toThrow("Document is not valid");
  });
});

describe("getDocument", () => {
  test("should throw error when you try to get a document that is a queue number", async () => {
    const { id: queueNumber } = await getQueueNumber();

    await expect(getDocument(queueNumber)).rejects.toThrow("No Document Found");
  });

  test("should cleanup if cleanup flag is specified", async () => {
    const document = { foo: "bar" };

    const uploaded = await uploadDocument(document);

    const retrieve = await getDocument(uploaded.id, { cleanup: true });

    expect(retrieve).toMatchObject(thatIsRetrievedDocument);
    const retrieveAfterCleanup = getDocument(uploaded.id, { cleanup: true });
    await expect(retrieveAfterCleanup).rejects.toThrow("No Document Found");
  });
  test("should not cleanup if cleanup flag is off", async () => {
    const document = { foo: "bar" };

    const uploaded = await uploadDocument(document);

    const retrieve = await getDocument(uploaded.id, { cleanup: false });
    expect(retrieve).toMatchObject(thatIsRetrievedDocument);
    const retrieveAfter = await getDocument(uploaded.id, { cleanup: false });
    expect(retrieveAfter).toMatchObject(thatIsRetrievedDocument);
    expect(retrieveAfter.id).toEqual(uploaded.id);
  });
});

describe("getQueueNumber", () => {
  test("should return a plceholder object", async () => {
    const queueNumber = await getQueueNumber();
    expect(queueNumber).toMatchObject({
      created: expect.any(Number),
      awaitingUpload: true,
      key: expect.any(String),
      id: expect.stringMatching(uuidV4Regex),
      ttl: expect.any(Number)
    });
  });
});

describe("documentService", () => {
  test("should store and retrieve and decrypt the document", async () => {
    const document = { foo: "bar" };
    const uploaded = await uploadDocument(document);
    const retrieve = await getDocument(uploaded.id, { cleanup: false });
    expect(retrieve).toMatchObject(thatIsRetrievedDocument);

    const decryptedDoc = JSON.parse(
      decryptString({
        tag: retrieve.document.tag,
        cipherText: retrieve.document.cipherText,
        iv: retrieve.document.iv,
        key: uploaded.key,
        type: "OPEN-ATTESTATION-TYPE-1"
      })
    );

    expect(decryptedDoc).toMatchObject(document);
  });
});
