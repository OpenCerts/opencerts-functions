const { handler: getHandler } = require("./get");
const { handler: createAtIdHandler } = require("./createAtId");
const { handler: createHandler } = require("./create");
const { handler: queueNumberHandler } = require("./queueNumber");

module.exports = {
  getHandler,
  createAtIdHandler,
  createHandler,
  queueNumberHandler,
};
