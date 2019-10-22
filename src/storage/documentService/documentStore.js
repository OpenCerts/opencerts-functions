const uuid = require("uuid/v4");
const { verify } = require("@govtechsg/oa-verify");
const {
  encryptString,
  generateEncryptionKey
} = require("@govtechsg/opencerts-encryption");

const config = require("../config");
const { put, get, remove } = require("../s3");

const putDocument = async (document, id) => {
  const params = {
    BUCKET: config.s3.bucketName,
    KEY: id,
    BODY: JSON.stringify(document)
  };
  return put(params).then(() => ({ id: params.KEY }));
};

const getDocument = async (id, { cleanup } = { cleanup: false }) => {
  const params = {
    TableName: config.s3.bucketName,
    Key: id
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

const getDecryptionKey = async id => {
  const params = {
    TableName: config.s3.bucketName,
    KEY: id
  };
  const document = await get(params);
  return document;
};

const uploadDocument = async (
  document,
  documentId,
  network = config.network
) => {
  const verificationResults = await verify(document, network);

  if (!verificationResults.valid) {
    throw new Error("Document is not valid");
  }

  const placeHolderObj = documentId
    ? await getDecryptionKey(documentId)
    : undefined;
  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document),
    placeHolderObj ? placeHolderObj.key : undefined
  );

  const documentName =
    placeHolderObj && placeHolderObj.awaitingUpload
      ? documentId
      : `${uuid()}.json`;
  const { id } = await putDocument({ cipherText, iv, tag }, documentName);

  return {
    id,
    key,
    type
  };
};

const getQueueNumber = async () => {
  const created = Math.floor(Date.now() / 1000);
  const id = uuid();
  const tempData = {
    id,
    key: generateEncryptionKey(),
    awaitingUpload: true,
    created
  };
  const params = {
    BUCKET: config.s3.bucketName,
    BODY: JSON.stringify(tempData),
    KEY: `${id}.json`
  };
  return put(params).then(() => ({ key: tempData.key, id: `${id}.json` }));
};

module.exports = {
  putDocument,
  getQueueNumber,
  uploadDocument,
  getDocument
};
