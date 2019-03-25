const verify = require("./verify");

const handler = async (event, _context, callback) => {
  const { certificate } = JSON.parse(event.body);
  try {
    const verificationResults = await verify(certificate);
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verificationResults)
    });
  } catch (e) {
    callback(null, {
      statusCode: 501,
      body: e.message
    });
  }
};

module.exports = {
  handler
};
