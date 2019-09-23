const middy = require("middy");
const { cors } = require("middy/middlewares");
const uuid = require("uuid/v4");

const handleQueueNumber = async () => {
  const id = uuid();
  return {
    statusCode: 200,
    body: JSON.stringify({ queueNumber: id })
  };
};

const handler = middy(handleQueueNumber).use(cors());

module.exports = {
  handler
};
