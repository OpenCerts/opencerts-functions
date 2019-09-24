jest.mock("../dynamoDb");
jest.mock("./crypto");
jest.mock("@govtechsg/oa-verify");

const verify = require("@govtechsg/oa-verify");
const mainnetCert = require("../../../test/fixtures/certificateMainnetValid.json");
const dynamoDb = require("../dynamoDb");
const crypto = require("./crypto");

const {
  uploadDocument,
  putDocument,
  DEFAULT_TTL,
  getDocument
} = require("./documentService");

const uuidV4Regex = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);
describe("documentService", () => {
  describe("putDocument", () => {
    it("should call put and return the right results", async () => {
      dynamoDb.put.mockResolvedValue();
      const document = { foo: "bar" };
      const uuid = "1e43994b-508d-4382-b756-5818a619c65a";
      const res = await putDocument(document, uuid);

      expect(res.document).toEqual(document);
      expect(res.ttl).toEqual(res.created + DEFAULT_TTL);
      expect(res.id).toMatch(uuidV4Regex);
    });
  });

  describe("uploadDocument", () => {
    crypto.encryptString.mockResolvedValue({
      encryptedString: "foo",
      key: "bar",
      type: "PGP"
    });

    verify.mockResolvedValue({ valid: true });

    it("should return the expected result when uuid is passed", async () => {
      const uuid = "1e43994b-508d-4382-b756-5818a619c65a";
      dynamoDb.get.mockReturnValueOnce({
        id: "1e43994b-508d-4382-b756-5818a619c65a"
      });
      const result = await uploadDocument(mainnetCert, uuid);
      expect(result).toMatchObject({
        id: expect.stringMatching(uuidV4Regex),
        ttl: expect.any(Number),
        key: expect.any(String)
      });
      expect(result.id).toEqual(uuid);
    });

    it("should return the expected result when there is no uuid", async () => {
      const result = await uploadDocument(mainnetCert);
      expect(result).toMatchObject({
        id: expect.stringMatching(uuidV4Regex),
        ttl: expect.any(Number),
        key: expect.any(String)
      });
    });

    it("should throw an error when wrong uuid is passed", async () => {
      const uuid = "1e43994b-508d-4382-b756-5818a619c65b";
      await expect(uploadDocument(mainnetCert, uuid)).rejects.toThrow(
        "Can not find the valid queue number"
      );
    });

    it("should throw an error if its not a valid opencert", async () => {
      verify.mockResolvedValue({ valid: false });
      dynamoDb.get.mockReturnValueOnce({
        id: "1e43994b-508d-4382-b756-5818a619c65a"
      });
      await expect(
        uploadDocument({ foo: "bar" }, "1e43994b-508d-4382-b756-5818a619c65a")
      ).rejects.toThrow("Document is not valid");
    });
  });

  describe("getDocument", () => {
    it("should return the document result when uuid is passed", async () => {
      const uuid = "1e43994b-508d-4382-b756-5818a619c65a";
      dynamoDb.get.mockReturnValueOnce({
        id: "1e43994b-508d-4382-b756-5818a619c65a",
        ttl: 1234,
        key: "abc"
      });
      const result = await getDocument(uuid, { cleanup: false });
      expect(result).toMatchObject({
        id: expect.stringMatching(uuidV4Regex),
        ttl: expect.any(Number),
        key: expect.any(String)
      });
      expect(result.id).toEqual(uuid);
    });

    it("should return undefined when uuid doesn`t exist", async () => {
      const uuid = "1e43994b-508d-4382-b756-5818a619c65a";
      const result = await getDocument(uuid, { cleanup: false });
      expect(result).toEqual(undefined);
    });
  });
});
