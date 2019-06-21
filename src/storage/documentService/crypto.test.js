const crypto = require('crypto');
const {generateEncryptionKey, encryptString, PGP_META_LENGTHS} = require('./crypto');

/* eslint-disable no-param-reassign */
// doing fucky things here because window.crypto.randomBytes populates
// the array that's passed in rather than returning one
// also Jest fucks with window global so we need to put crypto back in for openpgp to work
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      const rand = crypto.randomBytes(arr.length);
      for (let i = 0; i <= arr.length; i += 1) {
        arr[i] = rand[i];
      }
    },
  },
});
/* eslint-enable */

describe('storage/crypto', () => {
  describe('generateEncryptionKey', () => {
    test('should generate a hexadecimal key of specified length', async () => {
      const generatedKey = await generateEncryptionKey(256);
      expect(generatedKey.length).toBe(64);
    });
    test('should generate different keys on each invocation', async () => {
      const key1 = await generateEncryptionKey(256);
      const key2 = await generateEncryptionKey(256);

      expect(key1 === key2).toBe(false);
    });
  });

  describe('encryptString', () => {
    let encryptionResults;
    beforeAll(async () => {
      encryptionResults = await encryptString('a');
    });
    test('should have pgp header and footer', async () => {
      const encryptedDocument = encryptionResults.encryptedString;
      const header = encryptedDocument.slice(0, PGP_META_LENGTHS.header);
      const footer = encryptedDocument.slice(-PGP_META_LENGTHS.footer);

      expect(header).toBe('-----BEGIN PGP MESSAGE-----\r\n\r\n');
      expect(footer).toBe('\r\n-----END PGP MESSAGE-----\r\n');
    });
    test('should throw error if input is not a string', async () => {
      await expect(encryptString({})).rejects.toThrow();
    });
  });
});
