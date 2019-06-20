const verify = require('@govtechsg/oa-verify');
const crypto = require('crypto');
const uuid = require('uuid/v4');
const config = require('../config');
const {put} = require('../dynamoDb');

const KEY_STRENGTH = 32; // bytes
const DEFAULT_TTL = 1000 * 60 * 5; // 5 Minutes
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_IV = new Buffer(crypto.randomBytes(16));

const putDocument = async (document) => {
  const created = Date.now();
  const params = {
    TableName: config.dynamodb.storageTableName,
    Item: {
      id: uuid(),
      document,
      created,
      ttl: created + DEFAULT_TTL,
    },
  };

  return put(params).then(() => params.Item);
};

const cipher = (message, key) => {
  const cipherInstance = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, ENCRYPTION_IV);
  const encrypted = cipherInstance.update(message) + cipherInstance.final();
  return encrypted;
};

const decipher = (encrypted, key) => {
  const decipherInstance = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, ENCRYPTION_IV);
  const decrypted = decipherInstance.update(encrypted) + decipherInstance.final();
  return decrypted;
};

const encryptDocument = (document) => {
  const key = crypto.randomBytes(KEY_STRENGTH);
  const encrypted = cipher(JSON.stringify(document), key);
  return {
    encrypted,
    key: key.toString('hex'),
  };
};

const decryptDocument = (encrypted, key) => {
  const message = decipher(encrypted, Buffer.from(key, 'hex'));
  return JSON.parse(message);
};

const uploadDocument = async (document, network = 'homestead') => {
  const verificationResults = await verify(document, network);
  if (!verificationResults.valid) throw new Error('Document is not valid');
  const {encrypted, key} = encryptDocument(document);
  const {id, ttl} = await putDocument(encrypted);
  return {
    id,
    ttl,
    key,
  };
};

/**
 * Todo
 * - Verify document first
 * - Encrypt document with randomly generate key
 * - Return key to client
 * - Options (custom ttl)
 * - Options (network: homestead/ropsten)
 */

module.exports = {
  cipher,
  decipher,
  putDocument,
  DEFAULT_TTL,
  encryptDocument,
  decryptDocument,
  uploadDocument,
};
