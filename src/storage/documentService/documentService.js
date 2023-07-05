const uuid = require("uuid/v4");
const { verify, isValid } = require("@govtechsg/opencerts-verify");
const {
  encryptString,
  generateEncryptionKey
} = require("@govtechsg/oa-encryption");

const config = require("../config");
const { put, get, remove } = require("../s3");

const DEFAULT_TTL_IN_MICROSECONDS = 30 * 24 * 60 * 60 * 1000; // 30 Days
const MAX_TTL_IN_MICROSECONDS = 90 * 24 * 60 * 60 * 1000; // 90 Days

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
    document.document.ttl < Date.now() // if the document has expired, tell the user that it doesn't exist
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

const calculateExpiryTimestamp = ttlInMicroseconds =>
  Date.now() + ttlInMicroseconds;

const uploadDocumentAtId = async (
  document,
  documentId,
  ttlInMicroseconds = DEFAULT_TTL_IN_MICROSECONDS
) => {
  const placeHolderObj = await getDecryptionKey(documentId);
  if (!(placeHolderObj.key && placeHolderObj.awaitingUpload)) {
    // we get here when a file exists at location but is not a placeholder awaiting upload
    throw new Error(`No placeholder file`);
  }

  if (ttlInMicroseconds > MAX_TTL_IN_MICROSECONDS) {
    throw new Error("Ttl cannot exceed 90 days");
  }

  const fragments = await verify({ network: config.network })(document);
  if (!isValid(fragments)) {
    throw new Error("Document is not valid");
  }

  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document),
    placeHolderObj.key
  );
  const ttl = calculateExpiryTimestamp(ttlInMicroseconds);
  const { id } = await putDocument(
    {
      cipherText,
      iv,
      tag,
      type,
      ttl
    },
    documentId
  );
  return {
    id,
    key,
    type,
    ttl
  };
};

const uploadDocument = async (
  document,
  ttlInMicroseconds = DEFAULT_TTL_IN_MICROSECONDS
) => {
  const fragments = await verify({ network: config.network })(document);
  if (!isValid(fragments)) {
    throw new Error("Document is not valid");
  }

  if (ttlInMicroseconds > MAX_TTL_IN_MICROSECONDS) {
    throw new Error("Ttl cannot exceed 90 days");
  }

  const { cipherText, iv, tag, key, type } = await encryptString(
    JSON.stringify(document)
  );

  const ttl = calculateExpiryTimestamp(ttlInMicroseconds);
  const { id } = await putDocument(
    {
      cipherText,
      iv,
      tag,
      type,
      ttl
    },
    uuid()
  );
  return {
    id,
    key,
    type,
    ttl
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
  calculateExpiryTimestamp,
  DEFAULT_TTL_IN_MICROSECONDS,
  MAX_TTL_IN_MICROSECONDS
};
