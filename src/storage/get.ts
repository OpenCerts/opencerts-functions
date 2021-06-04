import middy from "@middy/core";
import cors from "@middy/http-cors";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { getDocument } from "./services/documentService";
import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import createError from "http-errors";
import { unknownErrorHandler } from "../unknownErrorHandler";

const handleGet = async (event: APIGatewayRequestAuthorizerEvent) => {
  const id = event.pathParameters?.id;
  const cleanup = event.queryStringParameters?.cleanup === "true";
  if (!id) {
    throw new createError.BadRequest(
      "Please provide ID of document to retrieve"
    );
  }
  const document = await getDocument(id, { cleanup });
  return {
    statusCode: 200,
    body: JSON.stringify(document),
  };
};

export const handler = middy(handleGet)
  .use(jsonBodyParser())
  .use(unknownErrorHandler())
  .use(httpErrorHandler())
  .use(cors());
