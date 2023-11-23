import axios from "axios";

export class HuggingFaceClient {
    private readonly endpointUrl: string;
    private readonly apiKey: string;

    constructor(modelName: string, apiKey: string) {
        this.endpointUrl = `https://api-inference.huggingface.co/models/${modelName}`;
        this.apiKey = apiKey;
    }

    async getResponse(prompt: string): Promise<string> {
        try {
            const response = await axios.post(
                this.endpointUrl,
                {
                    inputs: prompt
                },
                {
                    headers: { Authorization: `Bearer ${this.apiKey}` }
                }
            );

            const generatedText = response.data[0].generated_text;
            return generatedText;
        } catch (error) {
            console.error("Error during Hugging Face request:", error);
            throw error;
        }
    }
}
