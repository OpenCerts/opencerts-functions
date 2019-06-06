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
    console.log("id", id);
    const document = await getDocument(id);
    console.log(document);
    const response = {
      statusCode: 200,
      body: "OK"
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
