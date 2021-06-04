import middy from "@middy/core";
import cors from "@middy/http-cors";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { getQueueNumber } from "./services/documentService";
import { unknownErrorHandler } from "../unknownErrorHandler";

const handleQueueNumber = async () => {
  const { id, key } = await getQueueNumber();
  return {
    statusCode: 200,
    body: JSON.stringify({ id, key }),
  };
};

export const handler = middy(handleQueueNumber)
  .use(jsonBodyParser())
  .use(unknownErrorHandler())
  .use(httpErrorHandler())
  .use(cors());
