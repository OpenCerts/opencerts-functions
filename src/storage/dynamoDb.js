const AWS = require("aws-sdk");

const options = process.env.IS_OFFLINE
  ? {
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "DEFAULT_ACCESS_KEY",
      secretAccessKey: "DEFAULT_SECRET"
    }
  : {};

const client = new AWS.DynamoDB.DocumentClient(options);

const promisifyClient = method => params =>
  new Promise((resolve, reject) => {
    client[method](params, (err, res) => {
      if (err) return reject(err);
      resolve(res.Item || res.Items);
    });
  });

const scan = promisifyClient("scan");
const put = promisifyClient("put");
const get = promisifyClient("get");

module.exports = { scan, put, get };
