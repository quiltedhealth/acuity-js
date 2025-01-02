import axios from "axios";

import AcuityScheduling from "../src/AcuityScheduling";

jest.mock("axios");

describe("AcuityScheduling", () => {
  let client;

  beforeEach(() => {
    client = new AcuityScheduling({
      userId: "12345",
      apiKey: "abc123",
    });
  });

  describe("constructor", () => {
    it("should set default base URL if not provided", () => {
      expect(client.base).toBe("https://acuityscheduling.com");
    });

    it("should set custom base URL if provided", () => {
      const customClient = new AcuityScheduling({
        base: "https://custom-url.com",
      });
      expect(customClient.base).toBe("https://custom-url.com");
    });

    it("should set apiKey and userId", () => {
      expect(client.apiKey).toBe("abc123");
      expect(client.userId).toBe("12345");
    });
  });

  describe("_request", () => {
    it("should make axios request with correct config", async () => {
      const mockResponse = { data: { success: true } };
      axios.mockResolvedValue(mockResponse);

      const callback = jest.fn();
      await client._request(
        "/test-path",
        {
          method: "POST",
          body: { test: true },
          auth: { user: "test", pass: "pass" },
          headers: { "Custom-Header": "value" },
        },
        callback,
      );

      expect(axios).toHaveBeenCalledWith({
        url: "https://acuityscheduling.com/api/v1/test-path",
        json: true,
        method: "POST",
        body: { test: true },
        auth: { user: "test", pass: "pass" },
        headers: {
          "Custom-Header": "value",
          "User-Agent": expect.stringContaining("AcuityScheduling-js/"),
        },
      });

      expect(callback).toHaveBeenCalledWith(null, mockResponse, mockResponse.data);
    });

    it("should handle errors", async () => {
      const error = new Error("Request failed");
      error.response = { data: { error: true } };
      axios.mockRejectedValue(error);

      const callback = jest.fn();
      await client._request("/test", {}, callback);

      expect(callback).toHaveBeenCalledWith(error, error.response, error.response.data);
    });
  });

  describe("request", () => {
    it("should call _request with auth credentials", async () => {
      const spy = jest.spyOn(client, "_request");
      const callback = jest.fn();

      await client.request("/test", { method: "GET" }, callback);

      expect(spy).toHaveBeenCalledWith(
        "/test",
        {
          method: "GET",
          auth: {
            user: "12345",
            pass: "abc123",
          },
        },
        callback,
      );
    });
  });
});
