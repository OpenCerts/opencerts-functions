jest.mock('../dynamoDb');
jest.mock('./crypto');
jest.mock('@govtechsg/oa-verify');

const verify = require('@govtechsg/oa-verify');
const mainnetCert = require('../../../test/fixtures/certificateMainnetValid.json');
const dynamoDb = require('../dynamoDb');
const crypto = require('./crypto');

const {uploadDocument, putDocument, DEFAULT_TTL} = require('./documentService');

const uuidV4Regex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
describe('documentService', () => {
  describe('putDocument', () => {
    it('should call put and return the right results', async () => {
      dynamoDb.put.mockResolvedValue();
      const document = {foo: 'bar'};
      const res = await putDocument(document);

      expect(res.document).toEqual(document);
      expect(res.ttl).toEqual(res.created + DEFAULT_TTL);
      expect(res.id).toMatch(uuidV4Regex);
    });
  });

  describe('uploadDocument', () => {
    crypto.encryptString.mockResolvedValue({encryptedString: 'foo', key: 'bar', type: 'PGP'});
    verify.mockResolvedValue({valid: true});
    it('works', async () => {
      const result = await uploadDocument(mainnetCert);
      expect(result).toMatchObject({
        id: expect.stringMatching(uuidV4Regex),
        ttl: expect.any(Number),
        key: expect.any(String),
      });
    });
    it('should throw an error if its not a valid opencert', async () => {
      verify.mockResolvedValue({valid: false});
      await expect(uploadDocument({foo: 'bar'})).rejects.toThrow('Document is not valid');
    });
  });
});
