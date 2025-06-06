import middy from "@middy/core";
import cors from "@middy/http-cors";
import { isValid } from "@govtechsg/opencerts-verify";

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
          all: isValid(fragments),
          documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
          documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
          issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"])
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
