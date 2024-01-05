const messageTemplate = require("../messageTemplate");

const FROM_ADDRESS = "OpenCerts™ <donotreply@mail.opencerts.io>";

// TODO: Filename according to recipient name
const FILE_NAME = "certificate.opencert";

const sendRawMail = (transporter, data) =>
  new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) return reject(err);
      return resolve(info);
    });
  });

// prefix is shitty and used only by the tests, I'm tired by this and dont want to find for another way to handle this
// enjoy yourself
const sendCertificate = transporter => async ({
  to,
  certificate,
  prefix = ""
}) => {
  const { html, text, subject } = messageTemplate(certificate);
  const content = JSON.stringify(certificate);

  // eslint-disable-next-line no-console
  console.log("Email:", to);
  // eslint-disable-next-line no-console
  console.log("Certificate:", content);

  return sendRawMail(transporter, {
    to,
    from: FROM_ADDRESS,
    subject,
    html,
    text,
    attachments: [
      {
        filename: "logo.png",
        path: `${prefix}static/logo.png`,
        cid: "logo"
      },
      {
        filename: "certificate.png",
        path: `${prefix}static/certificate.png`,
        cid: "certificate"
      },
      {
        filename: "dropzone.png",
        path: `${prefix}static/dropzone.png`,
        cid: "dropzone"
      },
      {
        filename: FILE_NAME,
        content
      }
    ]
  });
};

module.exports = sendCertificate;
