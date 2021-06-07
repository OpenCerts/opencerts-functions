import { utils } from "@govtechsg/open-attestation";
import { get, template } from "lodash";
import htmlMailTemplateContent from "./template.html";
import txtMailTemplateContent from "./template.txt";
import subjectMailTemplateContent from "./template.subject";
import createError from "http-errors";

const htmlMailTemplate = template(htmlMailTemplateContent);
const txtMailTemplate = template(txtMailTemplateContent);
const subjectMailTemplate = template(subjectMailTemplateContent);

export const messageTemplate = (certificate: any) => {
  if (!certificate) {
    throw new createError.BadRequest(
      "Provided document could not be emailed as it was either empty or not a valid OpenAttestation document"
    );
  }
  const data = utils.getData(certificate);
  if (!data) {
    throw new createError.BadRequest(
      "Provided document could not be emailed as it was either empty or not a valid OpenAttestation document"
    );
  }
  try {
    const issuerName = get(data, "issuers[0].name");
    const recipientName = get(data, "recipient.name");
    const params = { recipientName, issuerName };

    return {
      subject: subjectMailTemplate(params),
      html: htmlMailTemplate(params),
      text: txtMailTemplate(params),
    };
  } catch (e) {
    throw new createError.BadRequest("Fail to read data from certificate");
  }
};
