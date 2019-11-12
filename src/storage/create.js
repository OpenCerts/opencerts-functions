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
    // this error message shows up when the uuid already exists in dynamodb and we try to write to it
    if (e.message === "The conditional request failed") {
      return {
        statusCode: 400,
        body: "Unauthorised"
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

const handler = middy(handleCreate).use(cors());

module.exports = {
  handler
};
