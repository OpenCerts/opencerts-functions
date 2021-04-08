jest.mock("../s3");
jest.mock("@govtechsg/oa-encryption");
jest.mock("uuid/v4");
jest.mock("../config", () => ({ network: "ropsten" }));
const { encryptString } = require("@govtechsg/oa-encryption");
const uuid = require("uuid/v4");
const { get, put } = require("../s3");
const documentDidSigned = require("../../../test/fixtures/documentDidSigned.json");
const documentWithDocumentStore = require("../../../test/fixtures/documentWithDocumentStore.json");
const invalidDocumentFile = require("../../../test/fixtures/invalidDocument.json");
const certificate = require("../../../test/fixtures/certificate.json");
const {
  calculateExpiryTimestamp,
  getDocument,
  uploadDocument
} = require("./documentService");

jest.spyOn(Date, "now").mockImplementation(() => 1578897000000);

describe("uploadDocument", () => {
  it("should upload without any error for documents with Document Store", async () => {
    put.mockResolvedValue(true);
    uuid.mockReturnValue(123);
    encryptString.mockResolvedValue({
      cipherText: "MOCK_CIPHERTEXT",
      iv: "MOCK_IV",
      tag: "MOCK_TAG",
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1"
    });
    const upload = await uploadDocument(documentWithDocumentStore);
    expect(upload).toStrictEqual({
      id: 123,
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
      ttl: 1581489000000
    });
  });

  it("should upload without any error for documents from openCerts that are currently verified", async () => {
    put.mockResolvedValue(true);
    uuid.mockReturnValue(123);
    encryptString.mockResolvedValue({
      cipherText: "MOCK_CIPHERTEXT",
      iv: "MOCK_IV",
      tag: "MOCK_TAG",
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1"
    });
    const upload = await uploadDocument(certificate);
    expect(upload).toStrictEqual({
      id: 123,
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
      ttl: 1581489000000
    });
  });

  it("should upload without any error for document with DID signed", async () => {
    put.mockResolvedValue(true);
    uuid.mockReturnValue(123);
    encryptString.mockResolvedValue({
      cipherText: "MOCK_CIPHERTEXT",
      iv: "MOCK_IV",
      tag: "MOCK_TAG",
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1"
    });
    const upload = await uploadDocument(documentDidSigned);

    expect(upload).toStrictEqual({
      id: 123,
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
      ttl: 1581489000000
    });
  });

  it("should throw an error of 'Document is not valid' when document fail to verify", async () => {
    await expect(uploadDocument(invalidDocumentFile)).rejects.toThrow(
      "Document is not valid"
    );
  });

  it("should throw an error of 'Ttl cannot exceed 90 days' when ttl exceeds 90 days", async () => {
    const TTL_IN_MICROSECONDS = 91 * 24 * 60 * 60 * 1000;
    await expect(
      uploadDocument(documentWithDocumentStore, TTL_IN_MICROSECONDS)
    ).rejects.toThrow("Ttl cannot exceed 90 days");
  });
});

describe("calculateExpiryTimestamp", () => {
  it("should return the absolute timestamp given a relative ttl", () => {
    expect(calculateExpiryTimestamp(24 * 60 * 60 * 1000)).toBe(1578983400000);
  });
});

describe("getDocument", () => {
  it("should throw No Document Found if document has expired", async () => {
    const invalidDocument = {
      document: {
        cipherText: "MOCK_CIPHERTEXT",
        iv: "MOCK_IV",
        tag: "MOCK_TAG",
        type: "OPEN-ATTESTATION-TYPE-1",
        ttl: 1478983400000
      }
    };
    get.mockResolvedValue(invalidDocument);
    await expect(getDocument("ID")).rejects.toThrow("No Document Found");
  });

  it("should return document if document is found and has not expired", async () => {
    const validDocument = {
      document: {
        cipherText: "MOCK_CIPHERTEXT",
        iv: "MOCK_IV",
        tag: "MOCK_TAG",
        type: "OPEN-ATTESTATION-TYPE-1",
        ttl: 1578983400000
      }
    };
    get.mockResolvedValue(validDocument);
    const result = await getDocument("ID");
    expect(result).toEqual(validDocument);
  });
});
