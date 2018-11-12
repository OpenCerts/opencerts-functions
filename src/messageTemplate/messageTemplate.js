const path = require("path");
const fs = require("fs");
const opencerts = require("@govtechsg/open-certificate");
const { get, template } = require("lodash");

const htmlTemplatePath = path.join(__dirname, "./template.html");
const htmlMailTemplateContent = fs.readFileSync(htmlTemplatePath).toString();
const htmlMailTemplate = template(htmlMailTemplateContent);

const txtTemplatePath = path.join(__dirname, "./template.txt");
const txtMailTemplateContent = fs.readFileSync(txtTemplatePath).toString();
const txtMailTemplate = template(txtMailTemplateContent);

const subjectTemplatePath = path.join(__dirname, "./template.subject");
const subjectMailTemplateContent = fs
  .readFileSync(subjectTemplatePath)
  .toString();
const subjectMailTemplate = template(subjectMailTemplateContent);

const messageTemplate = certificate => {
  try {
    // Might throw if the certificate is undefined
    const data = opencerts.certificateData(certificate);
    if (!data) {
      throw new Error("Fail to read data from certificate");
    }

    const issuerName = get(data, "issuers[0].name");
    const recipientName = get(data, "recipient.name");
    const params = { recipientName, issuerName };

    return {
      subject: subjectMailTemplate(params),
      html: htmlMailTemplate(params),
      text: txtMailTemplate(params)
    };
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
    throw new Error("Fail to read data from certificate");
  }
};

module.exports = messageTemplate;
