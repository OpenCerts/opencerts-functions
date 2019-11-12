const middy = require("middy");
const { cors } = require("middy/middlewares");
const { uploadDocumentAtId } = require("./documentService");

const handleCreateAtId = async event => {
  try {
    const { document } = JSON.parse(event.body);
    const { id } = event.pathParameters;
    const receipt = await uploadDocumentAtId(document, id);
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
        body: JSON.stringify({ error: "Unauthorised Access" })
      };
    }
    return {
      statusCode: 400,
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
