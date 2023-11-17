export class Config {
    public readonly nodeEnv: string;
    public readonly chatGptApiKey: string;

    constructor() {
        this.nodeEnv = process.env.NODE_ENV || "";
        this.chatGptApiKey = process.env.CHATGPT_API_KEY || "";

        this.validateEnvVariables();
    }

    private validateEnvVariables(): void {
        const requiredEnvVars: { [key: string]: string } = {
            NODE_ENV: this.nodeEnv,
            CHATGPT_API_KEY: this.chatGptApiKey
        };

        for (const [varName, varValue] of Object.entries(requiredEnvVars)) {
            if (!varValue) {
                throw new Error(`Environment variable ${varName} is missing`);
            }
        }
    }
}
