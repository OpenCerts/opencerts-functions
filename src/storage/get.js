const middy = require("middy");
const { cors } = require("middy/middlewares");
const { getDocument } = require("./documentService");

const handleGet = async event => {
  try {
    const { id } = event.pathParameters;
    const { cleanup } = event.queryStringParameters || {
      queryStringParameters: { cleanup: false }
    };
    const document = await getDocument(id, { cleanup });
    return {
      statusCode: 200,
      body: JSON.stringify(document)
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e.message)
    };
  }
};

const handler = middy(handleGet).use(cors());

module.exports = {
  handler
};
