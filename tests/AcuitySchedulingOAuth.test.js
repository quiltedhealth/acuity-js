import axios from "axios";

import AcuitySchedulingOAuth from "../src/AcuitySchedulingOAuth";

jest.mock("axios");

describe("AcuitySchedulingOAuth", () => {
  const config = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    redirectUri: "http://test.com/callback",
    base: "https://api.test.com",
  };

  let oauth;

  beforeEach(() => {
    oauth = new AcuitySchedulingOAuth(config);
  });

  describe("constructor", () => {
    it("should initialize with config values", () => {
      expect(oauth.clientId).toBe(config.clientId);
      expect(oauth.clientSecret).toBe(config.clientSecret);
      expect(oauth.redirectUri).toBe(config.redirectUri);
      expect(oauth.base).toBe(config.base);
      expect(oauth.accessToken).toBeNull();
    });
  });

  describe("getAuthorizeUrl", () => {
    it("should throw error if scope is missing", () => {
      expect(() => oauth.getAuthorizeUrl({})).toThrow("Missing `scope` parameter.");
    });

    it("should return correct authorize URL", () => {
      const params = { scope: "api-v1", state: "test-state" };
      const url = oauth.getAuthorizeUrl(params);
      expect(url).toBe(
        `${config.base}/oauth2/authorize?response_type=code&scope=api-v1&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=test-state`,
      );
    });
  });

  describe("authorizeRedirect", () => {
    it("should redirect with correct URL", () => {
      const res = {
        writeHead: jest.fn(),
        send: jest.fn(),
      };
      const params = { scope: "api-v1" };
      oauth.authorizeRedirect(res, params);
      expect(res.writeHead).toHaveBeenCalledWith(302, { location: oauth.getAuthorizeUrl(params) });
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("requestAccessToken", () => {
    it("should request and store access token", async () => {
      const mockResponse = { data: { access_token: "test-token" } };
      axios.post.mockResolvedValue(mockResponse);

      const callback = jest.fn();
      await oauth.requestAccessToken("test-code", callback);

      expect(axios.post).toHaveBeenCalled();
      expect(oauth.accessToken).toBe("test-token");
      expect(callback).toHaveBeenCalledWith(null, mockResponse.data);
    });

    it("should handle errors", async () => {
      const error = new Error("Request failed");
      axios.post.mockRejectedValue(error);

      const callback = jest.fn();
      await oauth.requestAccessToken("test-code", callback);

      expect(callback).toHaveBeenCalledWith(error);
    });
  });

  describe("isConnected", () => {
    it("should return true when access token exists", () => {
      oauth.accessToken = "test-token";
      expect(oauth.isConnected()).toBe(true);
    });

    it("should return false when access token is null", () => {
      expect(oauth.isConnected()).toBe(false);
    });
  });

  describe("request", () => {
    it("should set authorization header with access token", () => {
      oauth.accessToken = "test-token";
      const options = {};
      oauth._request = jest.fn();

      oauth.request("/test", options);

      expect(options.headers.Authorization).toBe("Bearer test-token");
      expect(oauth._request).toHaveBeenCalled();
    });
  });
});
