const AWS = require("aws-sdk");

const s3bucket = new AWS.S3({
    s3ForcePathStyle: true,
  accessKeyId: "S3RVER",
  secretAccessKey: "S3RVER",
  region: "ap-southeast-1",
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  Bucket: "tradetrust-bucket"
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
