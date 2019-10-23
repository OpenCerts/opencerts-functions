const AWS = require("aws-sdk");

const s3bucket = new AWS.S3({
  accessKeyId: "AKIAW5WRLO5KX3ZHXGKT",
  secretAccessKey: "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",
  region: "ap-southeast-1",
  endpoint: new AWS.Endpoint('http://localhost:3000'),
  Bucket: "tradetrust"
});

const put = (...args) => s3bucket.upload(...args).promise();
const get = (...args) =>
  s3bucket
    .getObject(...args)
    .promise()
    .then(results => {
      if (results) {
        return JSON.parse(results);
      }
      throw new Error("No Document Found");
    });
const remove = (...args) => s3bucket.deleteObject(...args).promise();

module.exports = { put, get, remove };
