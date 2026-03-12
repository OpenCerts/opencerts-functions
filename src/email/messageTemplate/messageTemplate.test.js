const path = require("path");
const fs = require("fs");
const messageTemplate = require("./messageTemplate");
const certificate = require("../../../test/fixtures/certificate.json");

const expectedPathHtml = path.join(__dirname, "./expected.html");
const expectedContentHtml = fs.readFileSync(expectedPathHtml).toString();

const expectedPathTxt = path.join(__dirname, "./expected.txt");
const expectedContentTxt = fs.readFileSync(expectedPathTxt).toString();

const expectedPathSubject = path.join(__dirname, "./expected.subject");
const expectedContentSubject = fs.readFileSync(expectedPathSubject).toString();

describe("messageTemplate", () => {
  it("returns html and text given a certificate", () => {
    const extractContent = (str) => str.replace(/ +/g, "");
    const message = messageTemplate(certificate);
    expect(extractContent(message.html)).toEqual(
      extractContent(expectedContentHtml)
    );
    expect(extractContent(message.text)).toEqual(
      extractContent(expectedContentTxt)
    );
    expect(extractContent(message.subject)).toEqual(
      extractContent(expectedContentSubject)
    );
  });

  it("returns fallback for undefined certificate", () => {
    const message = messageTemplate();
    expect(message.subject).toContain("You have been sent a certificate");
    const message2 = messageTemplate(undefined);
    expect(message2.subject).toContain("You have been sent a certificate");
  });

  it("returns fallback for null certificate", () => {
    const message = messageTemplate(null);
    expect(message.subject).toContain("You have been sent a certificate");
  });

  it("returns fallback for invalid certificate", () => {
    const message = messageTemplate({ foo: "Invalid Data" });
    expect(message.subject).toContain("You have been sent a certificate");
  });
});
