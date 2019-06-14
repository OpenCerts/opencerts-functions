const middy = require("middy");
const { cors } = require("middy/middlewares");
const { putDocument } = require("./documentService");

const handleCreate = async (event, _context, callback) => {
  try {
    const { document } = JSON.parse(event.body);
    const receipt = await putDocument(document);
    const response = {
      statusCode: 200,
      body: JSON.stringify(receipt)
    };
    callback(null, response);
  } catch (e) {
    callback(e);
  }
};

const handler = middy(handleCreate).use(cors());

module.exports = {
  handler
};
