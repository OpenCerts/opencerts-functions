import middy from "@middy/core";
import cors from "@middy/http-cors";

const { uploadDocument } = require("./documentService");

const handleCreate = async (event) => {
  try {
    const { document, ttl } = JSON.parse(event.body);
    const receipt = await uploadDocument(document, ttl);
    return {
      statusCode: 200,
      body: JSON.stringify(receipt)
    };
  } catch (e) {
    // this error message shows up when the uuid already exists in dynamodb and we try to write to it
    if (e.message === "The conditional request failed") {
      return {
        statusCode: 400,
        body: "Unauthorised"
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

export const handler = middy().use(cors()).handler(handleCreate);
