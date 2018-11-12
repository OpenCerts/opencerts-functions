const messageTemplate = require("../messageTemplate");

const FROM_ADDRESS = "OpenCerts™ <donotreply@opencerts.io>";

// TODO: Filename according to recipient name
const FILE_NAME = "certificate.opencerts";

const sendRawMail = (transporter, data) =>
  new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) return reject(err);
      return resolve(info);
    });
  });

const sendCertificate = transporter => async ({ to, certificate }) => {
  // TODO: Check validity of certificate
  const { html, text, subject } = messageTemplate(certificate);
  const content = JSON.stringify(certificate);

  return sendRawMail(transporter, {
    to,
    from: FROM_ADDRESS,
    subject,
    html,
    text,
    attachments: [{ filename: FILE_NAME, content }]
  });
};

module.exports = sendCertificate;
