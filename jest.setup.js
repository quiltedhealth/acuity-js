const util = require("util");

// require('@testing-library/jest-dom');
const matchers = require("jest-extended");
const { enableFetchMocks } = require("jest-fetch-mock");

// TextDecoder was added to make the TextDecoder class from the Node.js util
// module available to Jest. It is required for react-email.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
global.TextDecoder = util.TextDecoder;

expect.extend(matchers);

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

beforeAll(() => {
  enableFetchMocks();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
});
