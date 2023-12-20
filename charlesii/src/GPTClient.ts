import { OpenAI } from "openai";
import * as vscode from "vscode";
import { EXTENSION_NAME } from "./constants";

export class GPTClient {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async getResponse(prompt: string): Promise<string> {
    try {
      const model =
        (vscode.workspace
          .getConfiguration(EXTENSION_NAME)
          .get("gpt.model") as string) || "text-davinci-003";

      const maxTokens =
        (vscode.workspace
          .getConfiguration(EXTENSION_NAME)
          .get("gpt.maxTokens") as number) || 150;

      const response = await this.openai.completions.create({
        model,
        prompt: prompt,
        max_tokens: maxTokens,
      });
      return response.choices[0].text.trim();
      // return `Yo the response is: ${new Date()}`;
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
