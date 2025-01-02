import { createHmac } from "crypto-browserify";

import AcuityScheduling from "./AcuityScheduling";
import AcuitySchedulingOAuth from "./AcuitySchedulingOAuth";
import { stringify } from "./utils";

const AcuityService = {
  basic(config) {
    return new AcuityScheduling(config);
  },

  oauth(config) {
    return new AcuitySchedulingOAuth(config);
  },

  /**
   * Verify the message signature using a shared secret.
   *
   * @param {string} secret - The shared secret to verify the message signature.
   * @param {string|Buffer} body - The body of the message to verify.
   * @param {string} signature - The signature to compare against.
   * @throws {Error} If the secret is missing or invalid, or if the signature verification fails.
   */
  verifyMessageSignature(secret, body, signature) {
    if (!secret || typeof secret !== "string") {
      throw new Error("The secret is missing or invalid.");
    }

    // Get hash of message using shared secret:
    const hasher = createHmac("sha256", secret);
    hasher.update(body.toString());
    const hash = hasher.digest("base64");

    // Compare hash to Acuity signature:
    if (hash.toLowerCase() !== signature.toLowerCase()) {
      throw new Error("Message signature verification failed.");
    }
  },

  /**
   * Middleware to verify the body of a request using a shared secret.
   *
   * @param {string} secret - The shared secret to verify the message signature.
   * @returns {function} Middleware function to verify the request body.
   */
  bodyParserVerify(secret) {
    return function (req, _res, buf, _encoding) {
      const body = buf.toString();
      const signature = req.headers["x-acuity-signature"];
      AcuityService.verifyMessageSignature(secret, body, signature);
    };
  },

  /**
   * Generate embed code for $owner.
   *
   * @param {number} owner  The owner's id.
   * @param {object} options  Additional options.
   *	- width  Iframe width
   *	- height  Iframe height
   *	- query  Query string arguments
   */
  getEmbedCode(owner, options) {
    const { height = "800", width = "100%", query = {} } = options || {};
    query.owner = query.owner || owner;
    options = { height, width, query };

    // Encode options:
    Object.keys(options).forEach((key) => {
      if (key === "query") {
        options[key] = stringify(options[key]);
      } else {
        options[key] = encodeURIComponent(options[key]);
      }
    });

    return (
      '<iframe src="https://app.acuityscheduling.com/schedule.php?' +
      options.query +
      '" width="' +
      options.width +
      '" height="' +
      options.height +
      '" frameBorder="0"></iframe>' +
      '<script src="https://embed.acuityscheduling.com/js/embed.js" type="text/javascript"></script>'
    );
  },
};

export default AcuityService;
