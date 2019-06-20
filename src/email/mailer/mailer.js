const messageTemplate = require('../messageTemplate');

const FROM_ADDRESS = 'OpenCerts™ <donotreply@opencerts.io>';

// TODO: Filename according to recipient name
const FILE_NAME = 'certificate.opencert';

const sendRawMail = (transporter, data) =>
  new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) return reject(err);
      return resolve(info);
    });
  });

const sendCertificate = (transporter) => async ({to, certificate}) => {
  const {html, text, subject} = messageTemplate(certificate);
  const content = JSON.stringify(certificate);

  return sendRawMail(transporter, {
    to,
    from: FROM_ADDRESS,
    subject,
    html,
    text,
    attachments: [
      {
        filename: 'logo.png',
        path: `${__dirname}/../static/logo.png`,
        cid: 'logo',
      },
      {
        filename: 'certificate.png',
        path: `${__dirname}/../static/certificate.png`,
        cid: 'certificate',
      },
      {
        filename: 'dropzone.png',
        path: `${__dirname}/../static/dropzone.png`,
        cid: 'dropzone',
      },
      {
        filename: FILE_NAME,
        content,
      },
    ],
  });
};

module.exports = sendCertificate;
