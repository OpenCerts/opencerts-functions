const verify = require("@govtechsg/oa-verify");
const uuid = require("uuid/v4");
const { encryptString } = require("./crypto");
const config = require("../config");
const { put, get, remove } = require("../dynamoDb");

const DEFAULT_TTL = 1000 * 60 * 5; // 5 Minutes

const putDocument = async document => {
  const created = Date.now(); // TTL is handled by dynamoDb natively, this timestamp has to be UTC unixtime
  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-how-to.html
  const params = {
    TableName: config.dynamodb.storageTableName,
    Item: {
      id: uuid(),
      document,
      created,
      ttl: created + DEFAULT_TTL
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
  if (cleanup && cleanup === "true") {
    await remove(params);
  }
  return document;
};

const uploadDocument = async (document, network = config.network) => {
  const verificationResults = await verify(document, network);
  if (!verificationResults.valid) throw new Error("Document is not valid");
  const { encryptedString, key, type } = await encryptString(
    JSON.stringify(document)
  );
  const { id, ttl } = await putDocument(encryptedString);
  return {
    id,
    ttl,
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
