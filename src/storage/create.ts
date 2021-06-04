import middy from "@middy/core";
import cors from "@middy/http-cors";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { uploadDocument } from "./services/documentService";
import { Number, Undefined } from "runtypes";
import createError from "http-errors";
import { unknownErrorHandler } from "../unknownErrorHandler";

const handleCreate = async (event: { body: any }) => {
  const { document, ttl } = event.body ?? {};
  if (
    // using object.keys to make sure document is an object, it's a bit dump though
    Object.keys(document ?? {}).length < 1 ||
    !(Number.guard(ttl) || Undefined.guard(ttl))
  ) {
    throw new createError.BadRequest(
      "Please provide the document and a valid TTL"
    );
  }
  const receipt = await uploadDocument(document, ttl);
  return {
    statusCode: 200,
    body: JSON.stringify(receipt),
  };
};

export const handler = middy(handleCreate)
  .use(jsonBodyParser())
  .use(unknownErrorHandler())
  .use(httpErrorHandler())
  .use(cors());
