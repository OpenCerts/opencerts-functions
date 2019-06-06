const uuid = require("uuid/v4");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const dynamodb = require("./dynamoDb");

// Creates a new document (and returns the decryption key)
const createDocument = async document => {
  const params = {
    TableName: process.env.OA_DOC_STORAGE_TABLE,
    Item: {
      id: uuid(),
      document,
      created: Date.now()
    }
  };

  return new Promise((resolve, reject) => {
    dynamodb.put(params, error => {
      if (error) {
        console.log("There")
        return reject(error);
      }
      console.log("Hre");
      resolve(params.Item);
    });
  });
};

const handleCreate = async (event, _context, callback) => {
  try {
    const { document } = JSON.parse(event.body);
    console.log(document);
    const receipt = await createDocument(document);
    console.log("Receipt", receipt)
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
