const middy = require("middy");
const { cors } = require("middy/middlewares");
const { getQueueNumber } = require("./documentService");

const handleQueueNumber = async () => {
  try {
    const { id, key } = await getQueueNumber();
    return {
      statusCode: 200,
      body: JSON.stringify({ queueNumber: id, key })
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    };
  }
};

const handler = middy(handleQueueNumber).use(cors());

module.exports = {
  handler
};
