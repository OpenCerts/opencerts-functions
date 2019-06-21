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

const scan = (...args) => dynamoClient.scan(...args).promise();
const put = (...args) => dynamoClient.put(...args).promise();
const get = (...args) => dynamoClient.get(...args).promise();
const remove = (...args) => dynamoClient.delete(...args).promise();

module.exports = {scan, put, get, remove};
