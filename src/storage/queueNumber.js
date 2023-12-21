const middy = require('@middy/core');
const cors = require('@middy/http-cors');
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

const handler = middy().use(cors()).handler(handleQueueNumber);

module.exports = {
  handler
};
