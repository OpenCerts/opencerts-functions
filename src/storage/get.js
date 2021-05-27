const middy = require("middy");
const { cors } = require("middy/middlewares");
const { getDocument } = require("./documentService");
const { CORS_POLICY_HEADER } = require("../../utils/cors");

const handleGet = async (event) => {
  try {
    const { id } = event.pathParameters;
    const cleanup =
      event.queryStringParameters &&
      event.queryStringParameters.cleanup === "true";
    const document = await getDocument(id, { cleanup });
    return {
      statusCode: 200,
      body: JSON.stringify(document),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: CORS_POLICY_HEADER,
      body: JSON.stringify({ error: e.message }),
    };
  }
};

const handler = middy(handleGet).use(cors());

module.exports = {
  handler,
};
