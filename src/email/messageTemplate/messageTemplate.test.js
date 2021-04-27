const path = require("path");
const fs = require("fs");
const messageTemplate = require("./messageTemplate");
const document = require("../../../test/fixtures/documentWithDocumentStore.json");

const expectedPathHtml = path.join(__dirname, "./expected.html");
const expectedContentHtml = fs.readFileSync(expectedPathHtml).toString();

const expectedPathTxt = path.join(__dirname, "./expected.txt");
const expectedContentTxt = fs.readFileSync(expectedPathTxt).toString();

const expectedPathSubject = path.join(__dirname, "./expected.subject");
const expectedContentSubject = fs.readFileSync(expectedPathSubject).toString();

describe("messageTemplate", () => {
  it("returns html and text given a document", () => {
    const extractContent = str => str.replace(/ +/g, "");
    const message = messageTemplate(document);
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

  it("throws for undefined document", () => {
    expect(() => messageTemplate()).toThrow();
    expect(() => messageTemplate(undefined)).toThrow();
  });

  it("throws for null document", () => {
    expect(() => messageTemplate(null)).toThrow();
  });

  it("throws for invalid document", () => {
    expect(() => messageTemplate({ foo: "Invalid Data" })).toThrow(
      "Fail to read data from document"
    );
  });
});
