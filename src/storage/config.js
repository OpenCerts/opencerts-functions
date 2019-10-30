const AWS = require("aws-sdk");

const config = () =>
  process.env.IS_OFFLINE
    ? {
        s3: {
          s3ForcePathStyle: true,
          accessKeyId: "S3RVER",
          secretAccessKey: "S3RVER",
          region: "us-west-2",
          endpoint: new AWS.Endpoint("http://localhost:8000")
        },
        bucketName: process.env.BUCKET_NAME,
        network: process.env.NETWORK || "ropsten"
      }
    : {
        s3: {
          region: process.env.SES_REGION || "us-west-2"
        },
        bucketName: process.env.BUCKET_NAME,
        network: process.env.NETWORK || "homestead"
      };

module.exports = config();
