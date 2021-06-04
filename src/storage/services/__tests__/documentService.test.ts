jest.mock("../s3");
jest.mock("@govtechsg/oa-encryption");
jest.mock("uuid");
jest.mock("../../config", () => ({ config: { network: "ropsten" } }));

import { encryptString } from "@govtechsg/oa-encryption";
import { v4 as uuid } from "uuid";
import {
  calculateExpiryTimestamp,
  getDocument,
  uploadDocument,
} from "../documentService";
import invalidDocumentFile from "../../../e2e/fixtures/invalidDocument.json";
import documentWithDocumentStore from "../../../e2e/fixtures/documentWithDocumentStore.json";
import documentDnsDidSigned from "../../../e2e/fixtures/documentDnsDidSigned.json";
import { get, put } from "../s3";

jest.spyOn(Date, "now").mockImplementation(() => 1578897000000);
const mockedPut = put as jest.Mock<ReturnType<typeof put>>;
const mockedGet = get as jest.Mock<ReturnType<typeof get>>;
const mockedUuid = uuid as jest.Mock<ReturnType<typeof uuid>>;
const mockedEncryptString = encryptString as jest.Mock<
  ReturnType<typeof encryptString>
>;

describe("uploadDocument", () => {
  it("should upload without any error for documents with Document Store", async () => {
    mockedPut.mockResolvedValue({
      Location: "string",
      ETag: "string",
      Bucket: "string",
      Key: "string",
    });
    mockedUuid.mockReturnValue("123");
    mockedEncryptString.mockReturnValue({
      cipherText: "MOCK_CIPHERTEXT",
      iv: "MOCK_IV",
      tag: "MOCK_TAG",
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
    });
    const upload = await uploadDocument(documentWithDocumentStore);
    expect(upload).toStrictEqual({
      id: "123",
      key: "4df5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
      ttl: 1581489000000,
    });
  });

  it("should upload without any error for document with DID signed", async () => {
    mockedPut.mockResolvedValue({
      Location: "string",
      ETag: "string",
      Bucket: "string",
      Key: "string",
    });
    mockedUuid.mockReturnValue("123");
    mockedEncryptString.mockReturnValue({
      cipherText: "MOCK_CIPHERTEXT",
      iv: "MOCK_IV",
      tag: "MOCK_TAG",
      key: "aaa5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
    });
    const upload = await uploadDocument(documentDnsDidSigned);

    expect(upload).toStrictEqual({
      id: "123",
      key: "aaa5cc8daff794d9ec536baf022e03f8ad0226a4e17dfe3fe624c16b2042f354",
      type: "OPEN-ATTESTATION-TYPE-1",
      ttl: 1581489000000,
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
        ttl: 1478983400000, // ttl is before the mocked date.now above
      },
    };
    mockedGet.mockResolvedValue(invalidDocument);
    await expect(getDocument("ID")).rejects.toThrow("No Document Found");
  });

  it("should return document if document is found and has not expired", async () => {
    const validDocument = {
      document: {
        cipherText: "MOCK_CIPHERTEXT",
        iv: "MOCK_IV",
        tag: "MOCK_TAG",
        type: "OPEN-ATTESTATION-TYPE-1",
        ttl: 1578983400000, // ttl is after the mocked date.now above
      },
    };
    mockedGet.mockResolvedValue(validDocument);
    const result = await getDocument("ID");
    expect(result).toEqual(validDocument);
  });
});
