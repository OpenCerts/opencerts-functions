const middy = require("middy");
const { cors } = require("middy/middlewares");
const { get } = require("./dynamoDb");

const getDocument = async id => {
  const params = {
    TableName: process.env.OA_DOC_STORAGE_TABLE,
    Key: {
      id
    }
  };

  return get(params);
};

const handleGet = async (event, _context, callback) => {
  try {
    const { id } = event.pathParameters;
    const document = await getDocument(id);
    const response = {
      statusCode: 200,
      body: JSON.stringify(document)
    };
    callback(null, response);
  } catch (e) {
    callback(e);
  }
};

const handler = middy(handleGet).use(cors());

module.exports = {
  handler
};
