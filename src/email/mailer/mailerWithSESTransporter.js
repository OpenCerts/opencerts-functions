const aws = require("aws-sdk");
const nodemailer = require("nodemailer");
const mailer = require("./mailer");

const SES = new aws.SES({
  apiVersion: "2010-12-01",
  accessKeyId: process.env.SES_KEY_ID,
  secretAccessKey: process.env.SES_SECRET,
  region: process.env.SES_REGION
});

const sesTransporter = nodemailer.createTransport({ SES });

module.exports = mailer(sesTransporter);
