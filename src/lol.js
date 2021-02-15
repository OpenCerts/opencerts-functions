const fetch = require("node-fetch");

// what's the hell I need this shit  !!!!!!!!!!!!!
// lol file
// I have no idea why, but it doesn't work if fetch is not shimmed. fetch is used by the esm build of ethersproject dep.
// Also, can't use directly ProvidePlugin from webpack because node-fetch is available in default property (esm) and thus the shim does not work.
// I'm tired will everything upgrade later
module.exports = fetch.default;
