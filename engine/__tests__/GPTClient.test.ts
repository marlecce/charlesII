import { OpenAI } from "openai";

const FAKE_API = "fake-api-key";
const EXPECTED_TEXT = "Hi There!";
const fakeResponse = { choices: [{ text: EXPECTED_TEXT }] };

jest.mock("openai", () => {
    return {
        OpenAI: jest.fn().mockImplementation(() => {
            return {
                completions: {
                    create: jest.fn().mockResolvedValue(fakeResponse)
                }
            };
        })
    };
});

import { GPTClient } from "../src/clients/GPTClient";

describe("GPTClient", () => {
    let client: GPTClient;

    beforeEach(() => {
        const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";
        client = new GPTClient(apiKey);
    });

    it("should correctly retrieve a response from the API", async () => {
        const prompt = "Hello, world!";

        const client = new GPTClient(FAKE_API);
        const response = await client.getResponse(prompt);

        expect(response).toBe(EXPECTED_TEXT);
    });

    it("should handle rate limit errors", async () => {
        const prompt = "Test prompt";
        const rateLimitError = new Error("Rate limit exceeded");
        Object.assign(rateLimitError, { response: { status: 429, headers: { "retry-after": "1" } } });

        const mockedOpenAI = new OpenAI({ apiKey: FAKE_API }) as jest.Mocked<OpenAI>;
        const mockedCreate = mockedOpenAI.completions.create as jest.Mock;

        mockedCreate.mockRejectedValueOnce(rateLimitError);
        mockedCreate.mockResolvedValueOnce(fakeResponse);

        const client = new GPTClient(FAKE_API);
        const response = await client.getResponse(prompt);

        expect(response).toBe(EXPECTED_TEXT);
    });
});
