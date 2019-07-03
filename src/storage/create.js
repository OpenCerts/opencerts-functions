const middy = require("middy");
const { cors } = require("middy/middlewares");
const { uploadDocument } = require("./documentService");

const handleCreate = async event => {
  try {
    const { document } = JSON.parse(event.body);
    const receipt = await uploadDocument(document);
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

const handler = middy(handleCreate).use(cors());

module.exports = {
  handler
};
