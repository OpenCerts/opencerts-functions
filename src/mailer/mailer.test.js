const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const mailer = require("./mailer");

const certificate = require("../../test/fixtures/certificate.json");

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
  const rawEmail = await fetch(url).then(res => res.text());
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

  before(async () => {
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
      certificate
    });
    const previewUrl = nodemailer.getTestMessageUrl(emailReceipt);
    // eslint-disable-next-line
    console.log(`Preview your message at ${previewUrl}`);
    const rawEmailUrl = `${previewUrl}/message.eml`;
    const valid = await validateRawEmail({
      url: rawEmailUrl,
      html: "You got a file from John Snow",
      text: "You got a file from John Snow",
      subject: "OpenCerts from John Snow",
      to: account.user
    });
    expect(valid).to.be.true;
  }).timeout(10000);
});
