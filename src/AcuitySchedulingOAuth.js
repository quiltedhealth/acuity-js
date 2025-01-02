/**
 * AcuitySchedulingOAuth Class
 */

import { stringify } from "./utils";

import axios from "axios";

import AcuityScheduling from "./AcuityScheduling";

class AcuitySchedulingOAuth {
  constructor(config = {}) {
    this.base = config.base || AcuityScheduling.base;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.accessToken = config.accessToken || null;

    return this;
  }
  getAuthorizeUrl(params = {}) {
    if (!params.scope) {
      throw new Error("Missing `scope` parameter.");
    }

    const query = {
      response_type: "code",
      scope: params.scope,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
    };

    if (params.state) {
      query.state = params.state;
    }

    return this.base + "/oauth2/authorize" + "?" + stringify(query);
  }
  authorizeRedirect(res, params) {
    res.writeHead(302, { location: this.getAuthorizeUrl(params) });
    res.send();
  }
  async requestAccessToken(code, cb) {
    const options = {
      headers: {
        "User-Agent": AcuityScheduling.agent,
      },
      form: {
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
    };

    try {
      const response = await axios.post(this.base + "/oauth2/token", options.form, {
        headers: options.headers,
      });
      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
      }
      cb(null, response.data);
    } catch (err) {
      cb(err);
    }
  }
  isConnected() {
    return !!this.accessToken;
  }
  request(path, options = {}, cb) {
    options = options || {};
    const headers = (options.headers = options.headers || {});
    headers.Authorization = headers.Authorization || "Bearer " + this.accessToken;
    return this._request(path, options, cb);
  }
}

export default AcuitySchedulingOAuth;
