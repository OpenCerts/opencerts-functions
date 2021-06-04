import { messageTemplate } from "../messageTemplate";
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const FROM_ADDRESS = "OpenCerts™ <donotreply@opencerts.io>";

// TODO: Filename according to recipient name
const FILE_NAME = "certificate.opencert";

const sendRawMail = (transporter: Transporter, data: Mail.Options) =>
  new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) return reject(err);
      return resolve(info);
    });
  });

// prefix is shitty and used only by the tests, I'm tired by this and dont want to find for another way to handle this
// enjoy yourself
export type Mailer = (options: {
  to: string;
  certificate: any;
  prefix?: string;
}) => Promise<any>;

export const mailer =
  (transporter: Transporter) =>
  async ({
    to,
    certificate,
    prefix = "",
  }: {
    to: string;
    certificate: any;
    prefix?: string;
  }) => {
    const { html, text, subject } = messageTemplate(certificate);
    const content = JSON.stringify(certificate);

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
          cid: "logo",
        },
        {
          filename: "certificate.png",
          path: `${prefix}static/certificate.png`,
          cid: "certificate",
        },
        {
          filename: "dropzone.png",
          path: `${prefix}static/dropzone.png`,
          cid: "dropzone",
        },
        {
          filename: FILE_NAME,
          content,
        },
      ],
    });
  };
