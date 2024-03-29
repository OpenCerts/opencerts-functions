import middy from "@middy/core";
import cors from "@middy/http-cors";

const { getQueueNumber } = require("./documentService");

const handleQueueNumber = async () => {
  try {
    const { id, key } = await getQueueNumber();
    return {
      statusCode: 200,
      body: JSON.stringify({ id, key })
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    };
  }
};

export const handler = middy().use(cors()).handler(handleQueueNumber);
