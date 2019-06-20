jest.mock('../dynamoDb');
const dynamoDb = require('../dynamoDb');
const config = require('../config');
const {cipher, decipher, encryptDocument, decryptDocument, putDocument, DEFAULT_TTL} = require('./documentService');
const openpgp = require('openpgp');

const crypto = require('crypto');

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  },
});

describe('documentService', () => {
  describe('putDocument', () => {
    it('should call put and return the right results', async () => {
      dynamoDb.put.mockResolvedValue();
      const document = {foo: 'bar'};
      const res = await putDocument(document);

      expect(res.document).toEqual(document);
      expect(res.ttl).toEqual(res.created + DEFAULT_TTL);
      expect(res.id).toBeTruthy();
    });
  });

  describe('encryptDocument', () => {
    it.only('works', async () => {});
  });
});

// documentService
// takes a opencert file and returns a url and a random passphrase
