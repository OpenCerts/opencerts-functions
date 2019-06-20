const AWS = require('aws-sdk');

const options = process.env.IS_OFFLINE
  ? {
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'DEFAULT_ACCESS_KEY',
      secretAccessKey: 'DEFAULT_SECRET',
    }
  : {};

const dynamoClient = new AWS.DynamoDB.DocumentClient(options);

const promisifyClient = (method, client) => (params) =>
  new Promise((resolve, reject) => {
    client[method](params, (err, res) => {
      if (err) return reject(err);
      resolve(res.Item || res.Items);
    });
  });

const scan = promisifyClient('scan', dynamoClient);
const put = promisifyClient('put', dynamoClient);
const get = promisifyClient('get', dynamoClient);

module.exports = {promisifyClient, scan, put, get};
