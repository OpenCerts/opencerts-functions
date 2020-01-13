const uuid = require("uuid/v4");
const { verify, isValid } = require("@govtechsg/opencerts-verify");
const {
  encryptString,
  generateEncryptionKey
} = require("@govtechsg/oa-encryption");

const config = require("../config");
const { put, get, remove } = require("../s3");

const putDocument = async (document, id) => {
  const params = {
    Bucket: config.bucketName,
    Key: id,
    Body: JSON.stringify({ document })
  };
  return put(params).then(() => ({ id: params.Key }));
};

const getDocument = async (id, { cleanup } = { cleanup: false }) => {
  const params = {
    Bucket: config.bucketName,
    Key: id
  };
  const document = await get(params);
  // we throw this error because if awaitingUpload exists on an object, it also has a decryption key in it and we don't want to return that, ever
  if (
    !document ||
    document.awaitingUpload ||
    document.document.ttl < Date.now()
  ) {
    throw new Error("No Document Found");
  }
  if (cleanup) {
    await remove(params);
  }
  return document;
};

const getDecryptionKey = async id => {
  const params = {
    Bucket: config.bucketName,
    Key: id
  };
  const document = await get(params);
  if (!document.key) throw new Error("The conditional request failed");
  return document;
};

const calculateAbsoluteTtl = relativeTtl => Date.now() + relativeTtl;

const uploadDocumentAtId = async (
  document,
  documentId,
  network = config.network
) => {
  const placeHolderObj = await getDecryptionKey(documentId);
  if (!(placeHolderObj.key && placeHolderObj.awaitingUpload)) {
    // we get here when a file exists at location but is not a placeholder awaiting upload
    throw new Error(`No placeholder file`);
  }

  const fragments = await verify(document, { network });
  if (!isValid(fragments)) {
    throw new Error("Document is not valid");
  }

  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document),
    placeHolderObj.key
  );

  const { id } = await putDocument({ cipherText, iv, tag, type }, documentId);
  return {
    id,
    key,
    type
  };
};

const uploadDocument = async (document, relativeTtl) => {
  const fragments = await verify(document, { network: config.network });
  if (!isValid(fragments)) {
    throw new Error("Document is not valid");
  }

  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document)
  );

  const { id } = await putDocument(
    { cipherText, iv, tag, type, ttl: calculateAbsoluteTtl(relativeTtl) },
    uuid()
  );
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
    Bucket: config.bucketName,
    Body: JSON.stringify(tempData),
    Key: id
  };
  return put(params).then(() => ({ key: tempData.key, id }));
};

module.exports = {
  putDocument,
  getQueueNumber,
  uploadDocument,
  uploadDocumentAtId,
  getDocument,
  calculateAbsoluteTtl
};
