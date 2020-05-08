jest.mock("../s3");
const { calculateExpiryTimestamp, getDocument } = require("./documentService");
const { get } = require("../s3");

jest.spyOn(Date, "now").mockImplementation(() => 1578897000000);

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
