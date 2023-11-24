import axios from "axios";
import { HuggingFaceClient } from "../src/clients/HuggingFaceClient";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const apiKey = process.env.HUGGING_FACE_API_KEY ? process.env.HUGGING_FACE_API_KEY : "";

describe("HuggingFaceClient", () => {
    let client: HuggingFaceClient;

    beforeEach(() => {
        const model = "codeparrot/codeparrot";
        client = new HuggingFaceClient(model, apiKey);
    });

    it("returns a correct response on success", async () => {
        const prompt = `def print_hello_world():`;
        const fakeResponse = { data: [{ generated_text: "print('Hello, World!')" }] };
        mockedAxios.post.mockResolvedValue(fakeResponse);

        const response = await client.getResponse(prompt);

        expect(response).toBe("print('Hello, World!')");

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `https://api-inference.huggingface.co/models/codeparrot/codeparrot`,
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );
    });
});
