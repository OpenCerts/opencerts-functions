const verify = require("@govtechsg/oa-verify");
const uuid = require("uuid/v4");
const { encryptString } = require("./crypto");
const config = require("../config");
const { put, get, remove } = require("../dynamoDb");

const DEFAULT_TTL = 60 * 60; // 1 Hour
const MAX_TTL = 60 * 60 * 24 * 30; // 30 Days

const putDocument = async (document, ttl = DEFAULT_TTL) => {
  const created = Math.floor(Date.now() / 1000);
  // TTL is handled by dynamoDb natively, this timestamp has to be UTC unixtime in seconds
  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-how-to.html
  const params = {
    TableName: config.dynamodb.storageTableName,
    Item: {
      id: uuid(),
      document,
      created,
      ttl: created + ttl
    }
  };

  return put(params).then(() => params.Item);
};

const getDocument = async (id, { cleanup }) => {
  const params = {
    TableName: process.env.OA_DOC_STORAGE_TABLE,
    Key: {
      id
    }
  };
  const document = await get(params);
  if (cleanup) {
    await remove(params);
  }
  return document;
};

const validateTtl = ttl => {
  if (typeof ttl !== "number" || ttl < 0)
    throw new Error("TTL must be a positive number of seconds");
  if (ttl > MAX_TTL) throw new Error("TTL exceeds maximum of 30 days");
  return true;
};

const uploadDocument = async (
  document,
  ttl = DEFAULT_TTL,
  network = config.network
) => {
  const verificationResults = await verify(document, network);
  if (!verificationResults.valid) throw new Error("Document is not valid");
  validateTtl(ttl);
  const { encryptedString, key, type } = await encryptString(
    JSON.stringify(document)
  );
  const { id, ttl: recordedTtl } = await putDocument(encryptedString, ttl);
  return {
    id,
    ttl: recordedTtl,
    key,
    type
  };
};

module.exports = {
  putDocument,
  DEFAULT_TTL,
  uploadDocument,
  getDocument
};
