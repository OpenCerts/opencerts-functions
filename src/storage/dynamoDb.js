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

const scan = params =>
  new Promise((resolve, reject) => {
    client.scan(params, (err, res) => {
      if (err) return reject(err);
      resolve(res.Items);
    });
  });

const put = params =>
  new Promise((resolve, reject) => {
    client.put(params, (err, res) => {
      if (err) return reject(err);
      resolve(res.Item);
    });
  });

const get = params =>
  new Promise((resolve, reject) => {
    client.get(params, (err, res) => {
      if (err) return reject(err);
      resolve(res.Item);
    });
  });

module.exports = { client, scan, put, get };
