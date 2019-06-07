const uuid = require("uuid/v4");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const { put } = require("./dynamoDb");

const DEFAULT_TTL = 1000 * 60 * 5; // 5 Minutes

// Creates a new document (and returns the decryption key)
const createDocument = async document => {
  const params = {
    TableName: process.env.OA_DOC_STORAGE_TABLE,
    Item: {
      id: uuid(),
      document,
      created: Date.now(),
      ttl: Date.now() + DEFAULT_TTL
    }
  };

  return put(params).then(() => JSON.stringify(params.Item));
};

/**
 * Todo
 * - Verify document first
 * - Encrypt document with randomly generate key
 * - Return key to client
 * - Options (custom ttl)
 * - Options (network: homestead/ropsten)
 */
const handleCreate = async (event, _context, callback) => {
  try {
    const { document } = JSON.parse(event.body);
    const receipt = await createDocument(document);
    const response = {
      statusCode: 200,
      body: receipt
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
