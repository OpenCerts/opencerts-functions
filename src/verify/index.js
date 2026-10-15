import middy from "@middy/core";
import cors from "@middy/http-cors";
import { isValidOpenCert } from "@trustvc/trustvc";

import { verifyRequestDocument } from "../shared/verify";
import { errorResponse, parseBody } from "../shared/errors";

const handleVerify = async (event, context) => {
  try {
    const { document } = parseBody(event);
    const fragments = await verifyRequestDocument(document);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: {
          all: isValidOpenCert(fragments),
          documentStatus: isValidOpenCert(fragments, ["DOCUMENT_STATUS"]),
          documentIntegrity: isValidOpenCert(fragments, ["DOCUMENT_INTEGRITY"]),
          issuerIdentity: isValidOpenCert(fragments, ["ISSUER_IDENTITY"])
        },
        data: fragments
      })
    };
  } catch (e) {
    return errorResponse(e, context);
  }
};

export const handler = middy().use(cors()).handler(handleVerify);
