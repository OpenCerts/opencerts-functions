const openAttestation = require("@govtechsg/open-attestation");
const { get, template } = require("lodash");
const htmlMailTemplateContent = require("./template.html");
const txtMailTemplateContent = require("./template.txt");
const subjectMailTemplateContent = require("./template.subject");

const htmlMailTemplate = template(htmlMailTemplateContent);
const txtMailTemplate = template(txtMailTemplateContent);
const subjectMailTemplate = template(subjectMailTemplateContent);

const messageTemplate = certificate => {
  try {
    // Might throw if the certificate is undefined
    const data = openAttestation.getData(certificate);
    if (!data) {
      throw new Error("Empty document");
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
    throw new Error("Fail to read data from certificate");
  }
};

module.exports = messageTemplate;
