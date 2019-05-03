const uuid = require('uuid/v4');
const middy = require("middy");
const { cors } = require("middy/middlewares");
const dynamodb = require("./dynamoDb");

const handleCreate = async (event, _context, callback) => {
  const params = {
    TableName: process.env.OA_DOC_STORAGE_TABLE,
    Item: {
      id: uuid(),
      document: "This is a document",
      created: Date.now()
    }
  };

  // write the todo to the database
  dynamodb.put(params, error => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't create the todo item."
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    };
    callback(null, response);
  });
};

const handler = middy(handleCreate).use(cors());

module.exports = {
  handler
};
