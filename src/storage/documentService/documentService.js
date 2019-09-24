const verify = require("@govtechsg/oa-verify");
const uuid = require("uuid/v4");
const { encryptString } = require("./crypto");
const config = require("../config");
const { put, get, remove, update } = require("../dynamoDb");

const DEFAULT_TTL = 60 * 60; // 1 Hour
const MAX_TTL = 60 * 60 * 24 * 30; // 30 Days

const putDocument = async (document, ttl = DEFAULT_TTL) => {
  // TTL is handled by dynamoDb natively, this timestamp has to be UTC unixtime in seconds
  const created = Math.floor(Date.now() / 1000);
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
  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document)
  );
  const { id, ttl: recordedTtl } = await putDocument(
    { cipherText, iv, tag },
    ttl
  );
  return {
    id,
    ttl: recordedTtl,
    key,
    type
  };
};

const getQueueNumber = async () => {
  const created = Math.floor(Date.now() / 1000);
  const params = {
    TableName: config.dynamodb.storageTableName,
    Item: {
      id: uuid(),
      created,
      awaitingUpload: true,
      ttl: created + DEFAULT_TTL
    }
  };
  return put(params).then(() => params.Item);
};

const updateDocument = async (
  document,
  docId,
  ttl = DEFAULT_TTL,
  network = config.network
) => {
  const verificationResults = await verify(document, network);
  if (!verificationResults.valid) throw new Error("Document is not valid");
  validateTtl(ttl);
  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document)
  );

  const created = Math.floor(Date.now() / 1000);
  const expireTime = created + ttl;
  const params = {
    TableName: config.dynamodb.storageTableName,
    Key: {
      id: docId
    },
    UpdateExpression:
      "SET document = :doc, created = :created, #et = :expireTime REMOVE awaitingUpload",
    ConditionExpression: "id = :docId and attribute_exists(awaitingUpload)",
    ExpressionAttributeValues: {
      ":doc": { cipherText, iv, tag, key, type },
      ":docId": docId,
      ":created": created,
      ":expireTime": expireTime
    },
    ExpressionAttributeNames: {
      "#et": "ttl"
    },
    ReturnValues: "UPDATED_NEW"
  };
  return update(params).then(() => ({ id: docId, ttl: expireTime, key, type }));
};

module.exports = {
  putDocument,
  DEFAULT_TTL,
  uploadDocument,
  getDocument,
  getQueueNumber,
  updateDocument
};
