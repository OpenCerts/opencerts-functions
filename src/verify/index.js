const middy = require("middy");
const { cors } = require("middy/middlewares");
const {
  openAttestationVerifiers,
  verificationBuilder,
  isValid
} = require("@govtechsg/oa-verify");
const config = require("./config");

const verify = verificationBuilder(openAttestationVerifiers, {
  network: config.network
});

// adding a comment to trigger a deploy
const handleVerify = async (event, _context, callback) => {
  const { document } = JSON.parse(event.body);
  try {
    const fragments = await verify(document);
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

const handler = middy(handleVerify).use(cors());

module.exports = {
  handler
};
