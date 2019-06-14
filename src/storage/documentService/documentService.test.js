jest.mock("../dynamoDb");
const dynamoDb = require("../dynamoDb");
const config = require("../config");
const {
  cipher,
  decipher,
  encryptDocument,
  decryptDocument,
  putDocument,
  DEFAULT_TTL
} = require("./documentService");
const openpgp = require("openpgp");

const crypto = require("crypto");

describe("documentService", () => {
  describe("putDocument", () => {
    it("should call put and return the right results", async () => {
      dynamoDb.put.mockResolvedValue();
      const document = { foo: "bar" };
      const res = await putDocument(document);

      expect(res.document).toEqual(document);
      expect(res.ttl).toEqual(res.created + DEFAULT_TTL);
      expect(res.id).toBeTruthy();
    });
  });

  describe("encryptDocument", () => {
    it("works", async () => {
      // const algorithm = 'aes-256-cbc';
      // const key = crypto.randomBytes(32);
      // const iv = crypto.randomBytes(16);

      // function encrypt(text) {
      //  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
      //  let encrypted = cipher.update(text);
      //  encrypted = Buffer.concat([encrypted, cipher.final()]);
      //  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
      // }
      //       console.log(encrypt("123"));

      // const options = {
      //   message: openpgp.message.fromBinary(new Uint8Array([0x01, 0x01, 0x01])), // input as Message object
      //   passwords: ["secret stuff"], // multiple passwords possible
      //   armor: false // don't ASCII armor (for Uint8Array output)
      // };

      // const ciphertext = await openpgp.encrypt(options);
      // const encrypted = ciphertext.message.packets.write(); // get raw encrypted packets as Uint8Array
      // console.log(encrypted);
      // let m = openpgp.message.fromText("hello world");

      // let options = { message: m, passwords: ["password"], armor: true };

      // openpgp.encrypt(options).then(console.log);
      const enc = encryptDocument("DOC");
      console.log(Buffer.from(enc.key, "hex"))
      const dec = decryptDocument(enc.encrypted, enc.key);
      console.log(dec);
    });
  });
});
