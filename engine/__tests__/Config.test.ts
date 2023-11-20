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
        process.env.SOCKET_SERVER_PORT = "3000";
        process.env.CHATGPT_API_KEY = "some_api_key";

        expect(() => {
            new Config();
        }).not.toThrow();
    });

    it("should throw an error if NODE_ENV is missing", () => {
        process.env.NODE_ENV = "";
        process.env.SOCKET_SERVER_PORT = "3000";
        process.env.CHAT_GPT_API_KEY = "some_api_key";

        expect(() => {
            new Config();
        }).toThrow("Environment variable NODE_ENV is missing");
    });

    it("should throw an error if CHATGPT_API_KEY is missing", () => {
        process.env.NODE_ENV = "development";
        process.env.SOCKET_SERVER_PORT = "3000";
        process.env.CHATGPT_API_KEY = "";

        expect(() => {
            new Config();
        }).toThrow("Environment variable CHATGPT_API_KEY is missing");
    });

    it("should throw an error if SOCKET_SERVER_PORT is missing", () => {
        process.env.NODE_ENV = "development";
        process.env.SOCKET_SERVER_PORT = "";
        process.env.CHATGPT_API_KEY = "some_api_key";

        expect(() => {
            new Config();
        }).toThrow("Environment variable SOCKET_SERVER_PORT is not a valid number");
    });
});
