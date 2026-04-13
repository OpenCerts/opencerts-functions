import middy from "@middy/core";
import cors from "@middy/http-cors";
import { isValidOpenCert } from "@trustvc/trustvc";

import { verify } from "../shared/verify";

const handleVerify = async (event) => {
  const { document } = JSON.parse(event.body);
  try {
    const fragments = await verify(document);
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
    return {
      statusCode: 400,
      body: e.message
    };
  }
};

export const handler = middy().use(cors()).handler(handleVerify);
