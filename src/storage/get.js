import middy from "@middy/core";
import cors from "@middy/http-cors";

const { getDocument } = require("./documentService");

const handleGet = async (event) => {
  try {
    const { id } = event.pathParameters;
    const cleanup =
      event.queryStringParameters &&
      event.queryStringParameters.cleanup === "true";
    const document = await getDocument(id, { cleanup });
    return {
      statusCode: 200,
      body: JSON.stringify(document)
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    };
  }
};

export const handler = middy().use(cors()).handler(handleGet);
