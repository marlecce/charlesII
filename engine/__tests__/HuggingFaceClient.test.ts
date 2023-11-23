import { HuggingFaceClient } from "../src/clients/HuggingFaceClient";

describe("HuggingFaceClient", () => {
    let client: HuggingFaceClient;

    beforeEach(() => {
        const apiKey = process.env.HUGGING_FACE_API_KEY ? process.env.HUGGING_FACE_API_KEY : "";
        const model = "codeparrot/codeparrot";
        client = new HuggingFaceClient(model, apiKey);
    });

    it("returns a correct response on success", async () => {
        const prompt = `def print_hello_world():`;
        const response = await client.getResponse(prompt);
        expect(response).toBeDefined();
    });
});
