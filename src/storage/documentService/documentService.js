const { verify } = require("@govtechsg/oa-verify");
const uuid = require("uuid/v4");
const {
  encryptString,
  generateEncryptionKey
} = require("@govtechsg/opencerts-encryption");
const config = require("../config");
const { put, get, remove } = require("../dynamoDb");

const DEFAULT_TTL = 60 * 60; // 1 Hour
const MAX_TTL = 60 * 60 * 24 * 30; // 30 Days

const putDocument = async (
  document,
  id,
  ttl = DEFAULT_TTL,
  conditionalParams
) => {
  // TTL is handled by dynamoDb natively, this timestamp has to be UTC unixtime in seconds
  const created = Math.floor(Date.now() / 1000);
  const params = {
    TableName: config.dynamodb.storageTableName,
    Item: {
      id,
      document,
      created,
      ttl: created + ttl
    },
    ...conditionalParams
  };
  return put(params).then(() => params.Item);
};

const getDocument = async (id, { cleanup } = { cleanup: false }) => {
  const params = {
    TableName: config.dynamodb.storageTableName,
    Key: {
      id
    }
  };
  const document = await get(params);
  // we throw this error because if awaitingUpload exists on an object, it also has a decryption key in it and we don't want to return that, ever
  if (document.awaitingUpload) {
    throw new Error("No Document Found");
  }
  if (cleanup) {
    await remove(params);
  }
  return document;
};
// We define this function separately to getDocument as we don't want a future dev to accidentally return a decryption key by using the wrong function
const getDecryptionKey = async id => {
  const params = {
    TableName: config.dynamodb.storageTableName,
    Key: {
      id
    }
  };
  const document = await get(params);
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
  documentId,
  ttl = DEFAULT_TTL,
  network = config.network
) => {
  const verificationResults = await verify(document, network);
  if (!verificationResults.valid) {
    throw new Error("Document is not valid");
  }

  validateTtl(ttl);

  const placeHolderObj = documentId
    ? await getDecryptionKey(documentId)
    : undefined;
  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document),
    placeHolderObj ? placeHolderObj.key : undefined
  );

  const { id, ttl: recordedTtl } = documentId
    ? await putDocument({ cipherText, iv, tag }, documentId, ttl, {
        ConditionExpression: "awaitingUpload = :aTrueValue",
        ExpressionAttributeValues: { ":aTrueValue": true }
      }) // This expression throws "The conditional request failed" if uuid already exists
    : await putDocument({ cipherText, iv, tag }, uuid(), ttl);

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
      key: generateEncryptionKey(),
      created,
      awaitingUpload: true,
      ttl: created + DEFAULT_TTL
    }
  };
  return put(params).then(() => params.Item);
};

module.exports = {
  putDocument,
  DEFAULT_TTL,
  uploadDocument,
  getDocument,
  getQueueNumber
};
