const AWS = require("aws-sdk");
const config = require("../config");

const s3bucket = new AWS.S3(config.s3);

const put = (...args) => s3bucket.upload(...args).promise();
const get = (...args) =>
  s3bucket
    .getObject(...args)
    .promise()
    .then((results) => {
      if (results) {
        return JSON.parse(results.Body.toString());
      }
      throw new Error("No Document Found");
    });
const remove = (...args) => s3bucket.deleteObject(...args).promise();

module.exports = { put, get, remove };
