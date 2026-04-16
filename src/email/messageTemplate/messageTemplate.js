const { getDataV2 } = require("@trustvc/trustvc");

const { get, template } = require("lodash");
const htmlMailTemplateContent = require("./template.html");
const txtMailTemplateContent = require("./template.txt");
const subjectMailTemplateContent = require("./template.subject");

const htmlMailTemplate = template(htmlMailTemplateContent);
const txtMailTemplate = template(txtMailTemplateContent);
const subjectMailTemplate = template(subjectMailTemplateContent);

const messageTemplate = (certificate) => {
  let issuerName;
  let recipientName;

  try {
    const data = getDataV2(certificate);
    if (data) {
      issuerName = get(data, "issuers[0].name");
      recipientName = get(data, "recipient.name");
    }
  } catch (e) {
    // default to both absent
  }

  const params = { recipientName, issuerName };
  return {
    subject: subjectMailTemplate(params),
    html: htmlMailTemplate(params),
    text: txtMailTemplate(params)
  };
};

module.exports = messageTemplate;
