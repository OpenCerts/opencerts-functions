jest.mock("@govtechsg/opencerts-verify"); // mocked because we'll test this part in e2e

const uuid = require("uuid/v4");
const { decryptString } = require("@govtechsg/oa-encryption");
const { isValid } = require("@govtechsg/opencerts-verify");
const {
  uploadDocument,
  uploadDocumentAtId,
  getDocument,
  getQueueNumber,
  DEFAULT_TTL_IN_MICROSECONDS,
  MAX_TTL_IN_MICROSECONDS
} = require("../../src/storage/documentService");

const {
  thatIsRetrievedDocument,
  thatIsRetrievedDocumentWithTtl,
  thatIsUploadResponse,
  thatIsAQueueNumber
} = require("../utils/matchers");

const TIME_SKEW_ALLOWANCE = 5000;

// TODO refactor those "integration" tests to NOT MOCK
describe("uploadDocument", () => {
  afterEach(() => {
    isValid.mockClear();
  });
  it("should work without queue number", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const uploaded = await uploadDocument(document);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults).toMatchObject(thatIsRetrievedDocumentWithTtl);
  });

  it("should throw error when document verification failed", async () => {
    const document = { foo: "bar" };
    isValid.mockReturnValueOnce(false);
    const uploaded = uploadDocument(document);
    await expect(uploaded).rejects.toThrow("Document is not valid");
  });

  it("should allow user to specify ttl", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const uploaded = await uploadDocument(document, 20000);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults.document.ttl).toBeLessThan(
      Date.now() + 20000 + TIME_SKEW_ALLOWANCE
    );
    expect(getResults).toMatchObject(thatIsRetrievedDocumentWithTtl);
  });

  it("should default ttl value to DEFAULT_TTL_IN_MICROSECONDS ", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const uploaded = await uploadDocument(document);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults.document.ttl).toBeLessThan(
      Date.now() + DEFAULT_TTL_IN_MICROSECONDS + TIME_SKEW_ALLOWANCE
    );
    expect(getResults).toMatchObject(thatIsRetrievedDocumentWithTtl);
  });

  it("should throw error when ttl value > MAX_TTL_IN_MICROSECONDS", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const uploaded = uploadDocument(document, MAX_TTL_IN_MICROSECONDS + 1);
    await expect(uploaded).rejects.toThrow("Ttl cannot exceed 90 days");
  });
});

describe("uploadDocumentAtId", () => {
  afterEach(() => {
    isValid.mockClear();
  });

  it("should throw error when you try to upload to a uuid that is not queue number but exist in db", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const { id: queueNumber } = await getQueueNumber();
    const uploaded = await uploadDocumentAtId(document, queueNumber);
    expect(uploaded).toMatchObject(thatIsUploadResponse);

    const uploadedRepeat = uploadDocumentAtId(document, queueNumber);
    await expect(uploadedRepeat).rejects.toThrow(
      "The conditional request failed"
    );
  });

  it("should work with queue number", async () => {
    isValid.mockReturnValueOnce(true);
    const { id: queueNumber } = await getQueueNumber();
    const document = { foo: "bar" };
    const uploaded = await uploadDocumentAtId(document, queueNumber);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults).toMatchObject(thatIsRetrievedDocument);
  });

  it("should throw error when you try to upload to a uuid that is not queue number", async () => {
    const document = { foo: "bar" };

    const uploaded = uploadDocumentAtId(document, uuid());

    await expect(uploaded).rejects.toThrow("The specified key does not exist.");
  });

  it("should throw error when document verification failed with queue number", async () => {
    const document = { foo: "bar" };
    const { id: queueNumber } = await getQueueNumber();
    isValid.mockReturnValueOnce(false);
    const uploaded = uploadDocumentAtId(document, queueNumber);
    await expect(uploaded).rejects.toThrow("Document is not valid");
  });

  it("should allow user to specify ttl", async () => {
    isValid.mockReturnValueOnce(true);
    const { id: queueNumber } = await getQueueNumber();
    const document = { foo: "bar" };
    const uploaded = await uploadDocumentAtId(document, queueNumber, 20000);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults.document.ttl).toBeLessThan(
      Date.now() + 20000 + TIME_SKEW_ALLOWANCE
    );
    expect(getResults).toMatchObject(thatIsRetrievedDocumentWithTtl);
  });

  it("should default ttl value to DEFAULT_TTL_IN_MICROSECONDS ", async () => {
    isValid.mockReturnValueOnce(true);
    const { id: queueNumber } = await getQueueNumber();
    const document = { foo: "bar" };
    const uploaded = await uploadDocumentAtId(document, queueNumber);
    expect(uploaded).toMatchObject(thatIsUploadResponse);
    const getResults = await getDocument(uploaded.id);
    expect(getResults.document.ttl).toBeLessThan(
      Date.now() + DEFAULT_TTL_IN_MICROSECONDS + TIME_SKEW_ALLOWANCE
    );
    expect(getResults).toMatchObject(thatIsRetrievedDocumentWithTtl);
  });

  it("should throw error when ttl value > MAX_TTL_IN_MICROSECONDS", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const { id: queueNumber } = await getQueueNumber();
    const uploaded = uploadDocumentAtId(
      document,
      queueNumber,
      MAX_TTL_IN_MICROSECONDS + 1
    );
    await expect(uploaded).rejects.toThrow("Ttl cannot exceed 90 days");
  });
});

describe("getDocument", () => {
  afterEach(() => {
    isValid.mockClear();
  });
  it("should throw error when you try to get a document that is a queue number", async () => {
    const { id: queueNumber } = await getQueueNumber();
    await expect(getDocument(queueNumber)).rejects.toThrow("No Document Found");
  });

  it("should cleanup if cleanup flag is specified", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const { id: queueNumber } = await getQueueNumber();
    await uploadDocumentAtId(document, queueNumber);
    const retrieve = await getDocument(queueNumber, { cleanup: true });

    expect(retrieve).toMatchObject(thatIsRetrievedDocument);
    const retrieveAfterCleanup = getDocument(queueNumber, { cleanup: true });
    await expect(retrieveAfterCleanup).rejects.toThrow(
      "The specified key does not exist."
    );
  });
  it("should not cleanup if cleanup flag is off", async () => {
    isValid.mockReturnValueOnce(true);
    const document = { foo: "bar" };
    const { id: queueNumber } = await getQueueNumber();
    await uploadDocumentAtId(document, queueNumber);
    const retrieve = await getDocument(queueNumber, { cleanup: false });
    expect(retrieve).toMatchObject(thatIsRetrievedDocument);
    const retrieveAfter = await getDocument(queueNumber, { cleanup: false });
    expect(retrieveAfter).toMatchObject(thatIsRetrievedDocument);
  });
});

describe("getQueueNumber", () => {
  it("should return a placeholder object", async () => {
    const queueNumber = await getQueueNumber();
    expect(queueNumber).toMatchObject(thatIsAQueueNumber);
  });
});

describe("documentService", () => {
  afterEach(() => {
    isValid.mockClear();
  });
  it("should store and retrieve and decrypt the document", async () => {
    const document = { foo: "bar" };
    isValid.mockReturnValueOnce(true);
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

    expect(decryptedDoc).toStrictEqual(document);
  });
});
