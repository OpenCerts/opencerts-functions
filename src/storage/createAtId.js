import middy from "@middy/core";
import cors from "@middy/http-cors";

const { uploadDocumentAtId } = require("./documentService");

const handleCreateAtId = async (event) => {
  try {
    const { document, ttl } = JSON.parse(event.body);
    const { id } = event.pathParameters;
    const receipt = await uploadDocumentAtId(document, id, ttl);
    return {
      statusCode: 200,
      body: JSON.stringify(receipt)
    };
  } catch (e) {
    if (
      e.message === "The specified key does not exist." ||
      e.message === "No placeholder file"
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Unauthorised Access" })
      };
    }
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: e.message
      })
    };
  }
};

export const handler = middy().use(cors()).handler(handleCreateAtId);
