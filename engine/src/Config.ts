export class Config {
    public readonly nodeEnv: string;
    public readonly socketServerPort: number;

    constructor() {
        this.nodeEnv = process.env.NODE_ENV || "";
        this.socketServerPort = parseInt(process.env.SOCKET_SERVER_PORT || "");

        this.validateEnvVariables();
    }

    private validateEnvVariables(): void {
        const requiredEnvVars: { [key: string]: string | number } = {
            NODE_ENV: this.nodeEnv,
            SOCKET_SERVER_PORT: this.socketServerPort
        };

        for (const [varName, varValue] of Object.entries(requiredEnvVars)) {
            if (varName !== "SOCKET_SERVER_PORT" && !varValue) {
                throw new Error(`Environment variable ${varName} is missing`);
            }

            if (varName === "SOCKET_SERVER_PORT" && isNaN(this.socketServerPort)) {
                throw new Error(`Environment variable ${varName} is not a valid number`);
            }
        }
    }
}
