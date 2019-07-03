const middy = require("middy");
const { cors } = require("middy/middlewares");

const handleHealthcheck = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: "OK" })
});

const handler = middy(handleHealthcheck).use(cors());

module.exports = {
  handler
};
