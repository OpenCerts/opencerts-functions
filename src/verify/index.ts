import middy from "@middy/core";
import cors from "@middy/http-cors";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
} from "@govtechsg/oa-verify";
import { network } from "./config";
const verify = verificationBuilder(openAttestationVerifiers, {
  network,
});
import createError from "http-errors";
import { unknownErrorHandler } from "../unknownErrorHandler";

const handleVerify = async (event: { body: { document: any } }) => {
  const { document } = event.body ?? {};
  if (!document) {
    throw new createError.BadRequest(
      "Please provide a document to verify in the document body property"
    );
  }

  const fragments = await verify(document);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: {
        all: isValid(fragments),
        documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
        documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
        issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"]),
      },
      data: fragments,
    }),
  };
};

export const handler = middy(handleVerify)
  .use(jsonBodyParser())
  .use(unknownErrorHandler())
  .use(httpErrorHandler())
  .use(cors());
