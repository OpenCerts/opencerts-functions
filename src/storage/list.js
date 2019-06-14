const middy = require("middy");
const { cors } = require("middy/middlewares");
const { scan } = require("./dynamoDb/");

/**
 * Todo
 * - Remove function entirely
 */

const handleList = async (_event, _context, callback) => {
  const params = {
    TableName: process.env.OA_DOC_STORAGE_TABLE
  };

  const res = await scan(params);
  callback(null, { statusCode: 200, body: JSON.stringify(res) });
};

const handler = middy(handleList).use(cors());

module.exports = {
  handler
};
