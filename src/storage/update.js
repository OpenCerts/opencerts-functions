const middy = require("middy");
const { cors } = require("middy/middlewares");
const { updateDocument } = require("./documentService");

const handleUpdate = async event => {
  try {
    const { document, id, ttl } = JSON.parse(event.body);
    const time = ttl ? Number(ttl) : 60 * 60;
    const receipt = await updateDocument(document, id, time);
    return {
      statusCode: 200,
      body: JSON.stringify(receipt)
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: e.message
      })
    };
  }
};

const handler = middy(handleUpdate).use(cors());

module.exports = {
  handler
};
