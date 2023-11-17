import { Config } from "../src/Config";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should correctly instantiate with all required environment variables", () => {
    process.env.NODE_ENV = "development";
    process.env.CHATGPT_API_KEY = "some_api_key";

    expect(() => {
      new Config();
    }).not.toThrow();
  });

  it("should throw an error if NODE_ENV is missing", () => {
    process.env.NODE_ENV = "";
    process.env.CHAT_GPT_API_KEY = "some_api_key";

    expect(() => {
      new Config();
    }).toThrow("Environment variable NODE_ENV is missing");
  });

  it("should throw an error if CHATGPT_API_KEY is missing", () => {
    process.env.NODE_ENV = "development";
    process.env.CHATGPT_API_KEY = "";

    expect(() => {
      new Config();
    }).toThrow("Environment variable CHATGPT_API_KEY is missing");
  });
});
