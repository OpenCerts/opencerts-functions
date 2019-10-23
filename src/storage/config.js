const AWS = require("aws-sdk");

const config = () =>
  process.env.IS_OFFLINE
    ? {
        s3: {
          accessKeyId: "S3RVER",
          secretAccessKey: "S3RVER",
          region: "us-west-2",
          bucketName: "tradetrust-bucket",
          endpoint: new AWS.Endpoint('http://localhost:8000')
        },
        network:
          process.env.NETWORK === "undefined"
            ? "homestead"
            : process.env.NETWORK
      }
    : {
        s3: {
          accessKeyId: process.env.SES_KEY_ID,
          secretAccessKey: process.env.SES_SECRET,
          region: process.env.SES_REGION || "us-west-2",
          bucketName: process.env.BUCKET
        },
        network:
          process.env.NETWORK === "undefined"
            ? "homestead"
            : process.env.NETWORK
      };

module.exports = config();
