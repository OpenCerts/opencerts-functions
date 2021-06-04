import AWS from "aws-sdk";

if (!process.env.BUCKET_NAME) throw new Error("Please provide a bucket name");

export const config = process.env.IS_OFFLINE
  ? {
      s3: {
        s3ForcePathStyle: true,
        accessKeyId: "S3RVER",
        secretAccessKey: "S3RVER",
        region: "us-west-2",
        endpoint: new AWS.Endpoint("http://localhost:8000"),
      },
      bucketName: process.env.BUCKET_NAME,
      network: process.env.NETWORK || "ropsten",
    }
  : {
      s3: {
        region: process.env.S3_REGION || "ap-southeast-1",
      },
      bucketName: process.env.BUCKET_NAME,
      network: process.env.NETWORK || "homestead",
    };
