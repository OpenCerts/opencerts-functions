const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const { verify, isValid } = require("@govtechsg/opencerts-verify");
const config = require("./config");

// adding a comment to trigger a deploy
const handleVerify = async (event, _context, callback) => {
  const { document } = JSON.parse(event.body);
  try {
    const fragments = await verify({ network: config.network })(document);
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: {
          all: isValid(fragments),
          documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
          documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
          issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"])
        },
        data: fragments
      })
    });
  } catch (e) {
    callback(null, {
      statusCode: 400,
      body: e.message
    });
  }
};

const handler = middy().use(cors()).handler(handleVerify);

module.exports = {
  handler
};
