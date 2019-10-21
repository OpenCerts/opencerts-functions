const middy = require("middy");
const { cors } = require("middy/middlewares");
const { verify } = require("@govtechsg/oa-verify");
const config = require("./config");

const handleVerify = async (event, _context, callback) => {
  const { document } = JSON.parse(event.body);
  try {
    const verificationResults = await verify(document, config.network);
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verificationResults)
    });
  } catch (e) {
    callback(null, {
      statusCode: 400,
      body: e.message
    });
  }
};

const handler = middy(handleVerify).use(cors());

module.exports = {
  handler
};
