import { v4 as uuid } from "uuid";
import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
} from "@govtechsg/oa-verify";
import { encryptString, generateEncryptionKey } from "@govtechsg/oa-encryption";
import { config } from "../config";
import { get, put, remove } from "./s3";
import createError from "http-errors";
import { getLogger } from "../../logger";

const { error } = getLogger("storage");

export const DEFAULT_TTL_IN_MICROSECONDS = 30 * 24 * 60 * 60 * 1000; // 30 Days
export const MAX_TTL_IN_MICROSECONDS = 90 * 24 * 60 * 60 * 1000; // 90 Days

const verify = verificationBuilder(openAttestationVerifiers, {
  network: config.network,
});

const putDocument = async (document: any, id: string) => {
  const params = {
    Bucket: config.bucketName,
    Key: id,
    Body: JSON.stringify({ document }),
  };
  return put(params).then(() => ({ id: params.Key }));
};

export const getDocument = async (
  id: string,
  { cleanup } = { cleanup: false }
) => {
  const params = {
    Bucket: config.bucketName,
    Key: id,
  };
  const document = await get(params);
  // we throw this error because if awaitingUpload exists on an object, it also has a decryption key in it and we don't want to return that, ever
  if (
    !document ||
    document.awaitingUpload ||
    document.document.ttl < Date.now() // if the document has expired, tell the user that it doesn't exist
  ) {
    error(`No document found: ${JSON.stringify({ document })}`);
    throw new createError.BadRequest("No Document Found");
  }
  if (cleanup) {
    await remove(params);
  }
  return document;
};

const getDecryptionKey = async (id: string) => {
  const params = {
    Bucket: config.bucketName,
    Key: id,
  };
  const document = await get(params);
  if (!document.key) {
    error(`No key found in document: ${JSON.stringify({ document })}`);
    throw new createError.BadRequest(`Unauthorised Access`);
  }
  return document;
};

export const calculateExpiryTimestamp = (ttlInMicroseconds: number) =>
  Date.now() + ttlInMicroseconds;

export const uploadDocumentAtId = async (
  document: any,
  documentId: string,
  ttlInMicroseconds = DEFAULT_TTL_IN_MICROSECONDS
) => {
  const placeHolderObj = await getDecryptionKey(documentId);
  if (!(placeHolderObj.key && placeHolderObj.awaitingUpload)) {
    // we get here when a file exists at location but is not a placeholder awaiting upload
    error(
      `Tried to upload to an already uploaded document: ${JSON.stringify({
        documentId,
      })}`
    );
    throw new createError.BadRequest(`Unauthorised Access`);
  }

  if (ttlInMicroseconds > MAX_TTL_IN_MICROSECONDS) {
    error(
      `Ttl cannot exceed 90 days: ${JSON.stringify({
        ttl: ttlInMicroseconds,
      })}`
    );
    throw new createError.BadRequest("Ttl cannot exceed 90 days");
  }

  const fragments = await verify(document);
  if (!isValid(fragments)) {
    error(
      `Document is not valid: ${JSON.stringify({
        fragments,
      })}`
    );
    throw new createError.BadRequest("Document is not valid");
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
      ttl,
    },
    documentId
  );
  return {
    id,
    key,
    type,
    ttl,
  };
};

export const uploadDocument = async (
  document: any,
  ttlInMicroseconds = DEFAULT_TTL_IN_MICROSECONDS
) => {
  const fragments = await verify(document);
  if (!isValid(fragments)) {
    error(
      `Document is not valid: ${JSON.stringify({
        fragments,
      })}`
    );
    throw new createError.BadRequest("Document is not valid");
  }

  if (ttlInMicroseconds > MAX_TTL_IN_MICROSECONDS) {
    error(
      `Ttl cannot exceed 90 days: ${JSON.stringify({
        ttl: ttlInMicroseconds,
      })}`
    );
    throw new createError.BadRequest("Ttl cannot exceed 90 days");
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
      ttl,
    },
    uuid()
  );
  return {
    id,
    key,
    type,
    ttl,
  };
};

export const getQueueNumber = async () => {
  const created = Math.floor(Date.now() / 1000);
  const id = uuid();
  const tempData = {
    id,
    key: generateEncryptionKey(),
    awaitingUpload: true,
    created,
  };
  const params = {
    Bucket: config.bucketName,
    Body: JSON.stringify(tempData),
    Key: id,
  };
  return put(params).then(() => ({ key: tempData.key, id }));
};
