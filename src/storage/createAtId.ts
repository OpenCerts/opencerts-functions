import middy from "@middy/core";
import cors from "@middy/http-cors";
import { uploadDocumentAtId } from "./services/documentService";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { Number, String, Undefined } from "runtypes";
import createError from "http-errors";
import { unknownErrorHandler } from "../unknownErrorHandler";

const handleCreateAtId = async (event: {
  body: any;
  pathParameters: { id: string };
}) => {
  const { document, ttl } = event.body ?? {};
  const { id } = event.pathParameters;
  if (
    // using object.keys to make sure document is an object, it's a bit dump though
    Object.keys(document ?? {}).length < 1 ||
    !(Number.guard(ttl) || Undefined.guard(ttl)) ||
    !String.guard(id)
  ) {
    throw new createError.BadRequest(
      "Please provide the ID of the document, the document and a valid TTL"
    );
  }
  const receipt = await uploadDocumentAtId(document, id, ttl);
  return {
    statusCode: 200,
    body: JSON.stringify(receipt),
  };
};

export const handler = middy(handleCreateAtId)
  .use(jsonBodyParser())
  .use(unknownErrorHandler())
  .use(httpErrorHandler())
  .use(cors());
