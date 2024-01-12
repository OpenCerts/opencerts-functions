const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const mailer = require("./mailer");

const certificate = require("../../../test/fixtures/certificate.json");

const etherealCreateAccount = () =>
  new Promise((resolve, reject) => {
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        return reject(err);
      }
      return resolve(account);
    });
  });

const validateRawEmail = async ({ url, subject, text, html, to }) => {
  const rawEmail = await fetch(url).then((res) => res.text());
  return (
    rawEmail.includes(subject) &&
    rawEmail.includes(`To: ${to}`) &&
    (!text || rawEmail.includes(text)) &&
    (!html || rawEmail.includes(html))
  );
};

describe("mailer", () => {
  let account;
  let mailByEthereal;

  beforeAll(async () => {
    account = await etherealCreateAccount();
    const etherealTransporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    mailByEthereal = mailer(etherealTransporter);
  });

  it("sends test email through ethereal transporter", async () => {
    const emailReceipt = await mailByEthereal({
      to: account.user,
      certificate,
      prefix: `${__dirname}/../`
    });
    const previewUrl = nodemailer.getTestMessageUrl(emailReceipt);
    // eslint-disable-next-line
    console.log(`Preview your message at ${previewUrl}`);
    const rawEmailUrl = `${previewUrl}/message.eml`;
    const valid = await validateRawEmail({
      url: rawEmailUrl,
      html: "cid:certificate",
      text: "----------",
      subject: "Subject: Student Name PHARM Cert sent you a certificate",
      to: account.user
    });
    expect(valid).toBe(true);
  }, 20000);
});
