import path from "path";
import fs from "fs";
import { messageTemplate } from "./messageTemplate";
import certificate from "../../e2e/fixtures/certificate.json";

const expectedPathHtml = path.join(__dirname, "./expected.html");
const expectedContentHtml = fs.readFileSync(expectedPathHtml).toString();

const expectedPathTxt = path.join(__dirname, "./expected.txt");
const expectedContentTxt = fs.readFileSync(expectedPathTxt).toString();

const expectedPathSubject = path.join(__dirname, "./expected.subject");
const expectedContentSubject = fs.readFileSync(expectedPathSubject).toString();

describe("messageTemplate", () => {
  it("returns html and text given a certificate", () => {
    const extractContent = (str: string) => str.replace(/ +/g, "");
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

  it("throws for undefined certificate", () => {
    // @ts-expect-error invalid signature
    expect(() => messageTemplate()).toThrow();
    expect(() => messageTemplate(undefined)).toThrow();
  });

  it("throws for null certificate", () => {
    expect(() => messageTemplate(null)).toThrow();
  });

  it("throws for invalid certificate", () => {
    expect(() => messageTemplate({ foo: "Invalid Data" })).toThrow(
      "Empty document"
    );
  });
});
