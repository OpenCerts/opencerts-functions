const middy = require("middy");
const { cors } = require("middy/middlewares");
const uuid = require("uuid/v4");
const { uploadDocument } = require("./documentService");

const handleCreate = async event => {
  try {
    const { document, id, ttl } = JSON.parse(event.body);
    const docStoreId = id || uuid();
    const receipt = await uploadDocument(document, docStoreId, Number(ttl));
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
