/**
 * AcuityScheduling Class
 */

import axios from "axios";

import { version } from "../package";

const DEFAULTS = {
  base: "https://acuityscheduling.com",
  agent: "AcuityScheduling-js/" + version,
};

class AcuityScheduling {
  constructor(config = {}) {
    this.base = config.base || DEFAULTS.base;
    this.apiKey = config.apiKey;
    this.userId = config.userId;
    this.agent = config.agent || DEFAULTS.agent;

    return this;
  }
  async _request(path, options = {}, cb) {
    if (!cb) {
      cb = typeof options === "function" ? options : function () {};
    }

    path = typeof path === "string" ? path : "";
    const config = {
      url: this.base + "/api/v1" + (path.charAt(0) === "/" ? "" : "/") + path,
      json: true,
    };

    // Set configurable options:
    if (options.auth) {
      config.auth = options.auth;
    }
    if (options.body) {
      config.body = options.body;
    }
    if (options.method) {
      config.method = options.method;
    }
    if (options.qs) {
      config.qs = options.qs;
    }
    config.headers = options.headers || {};

    // User agent:
    config.headers["User-Agent"] = this.agent;

    try {
      const response = await axios(config);
      cb(null, response, response.data);
    } catch (err) {
      cb(err, err.response, err.response ? err.response.data : null);
    }
  }

  request(path, options = {}, cb) {
    options.auth = options.auth || {
      user: this.userId + "",
      pass: this.apiKey,
    };
    return this._request(path, options, cb);
  }
}

export default AcuityScheduling;
