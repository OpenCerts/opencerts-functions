const verify = require('@govtechsg/oa-verify');
const uuid = require('uuid/v4');
const {encryptString} = require('./crypto');
const config = require('../config');
const {put} = require('../dynamoDb');

const DEFAULT_TTL = 1000 * 60 * 5; // 5 Minutes

const putDocument = async (document) => {
  const created = Date.now(); // TTL is handled by dynamoDb natively, this timestamp has to be UTC unixtime
  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-how-to.html
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

const uploadDocument = async (document, network = 'homestead') => {
  const verificationResults = await verify(document, network);
  if (!verificationResults.valid) throw new Error('Document is not valid');
  const {encryptedString, key} = await encryptString(JSON.stringify(document));
  const {id, ttl} = await putDocument(encryptedString);
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
  putDocument,
  DEFAULT_TTL,
  uploadDocument,
};
