const aws = require("aws-sdk");
const nodemailer = require("nodemailer");
const mailer = require("./mailer");
const config = require("../config");

const SES = new aws.SES({
  apiVersion: "2010-12-01",
  accessKeyId: config.ses.accessKeyId,
  secretAccessKey: config.ses.secretAccessKey,
  region: config.ses.region,
});

const sesTransporter = nodemailer.createTransport({ SES });

module.exports = mailer(sesTransporter);
