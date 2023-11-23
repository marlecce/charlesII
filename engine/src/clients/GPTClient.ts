import { OpenAI } from "openai";

export class GPTClient {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async getResponse(prompt: string): Promise<string> {
        try {
            const response = await this.openai.completions.create({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 150
            });
            return response.choices[0].text.trim();
        } catch (error: any) {
            if (this.isRateLimitError(error)) {
                const retryAfter = this.getRetryAfterTime(error);
                await this.waitForRetry(retryAfter);
                return this.getResponse(prompt);
            } else {
                throw error;
            }
        }
    }

    private isRateLimitError(error: any): boolean {
        return error?.response?.status === 429;
    }

    private getRetryAfterTime(error: any): number {
        return parseInt(error?.response?.headers["retry-after"]) || 1;
    }

    private async waitForRetry(seconds: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
}
