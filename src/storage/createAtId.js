const middy = require("middy");
const { cors } = require("middy/middlewares");
const { uploadDocumentAtId } = require("./documentService");
const { CORS_POLICY_HEADER } = require("../../utils/cors");

const handleCreateAtId = async event => {
  try {
    const { document, ttl } = JSON.parse(event.body);
    const { id } = event.pathParameters;
    const receipt = await uploadDocumentAtId(document, id, ttl);
    return {
      statusCode: 200,
      body: JSON.stringify(receipt)
    };
  } catch (e) {
    if (
      e.message === "The specified key does not exist." ||
      e.message === "No placeholder file"
    ) {
      return {
        statusCode: 400,
        headers: CORS_POLICY_HEADER,
        body: JSON.stringify({ error: "Unauthorised Access" })
      };
    }
    return {
      statusCode: 400,
      headers: CORS_POLICY_HEADER,
      body: JSON.stringify({
        error: e.message
      })
    };
  }
};

const handler = middy(handleCreateAtId).use(cors());

module.exports = {
  handler
};
