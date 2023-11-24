import WebSocket, { Server } from "ws";
import logger from "../utils/Logger";
import { GPTClient } from "../clients/GPTClient";

export class SocketServer {
    private server: Server;
    private gptClient: GPTClient;

    constructor(port: number) {
        this.server = new WebSocket.Server({ port });
        this.server.on("connection", this.handleConnection.bind(this));
        this.gptClient = new GPTClient(process.env.OPENAI_API_KEY || "");
    }

    private handleConnection(ws: WebSocket): void {
        logger.debug("Client connected");

        ws.on("message", async (message: string) => {
            this.handleMessage(ws, message);
        });

        ws.on("close", () => {
            this.handleDisconnection(ws);
        });

        ws.on("error", (error) => {
            logger.error("Connection error:", error);
            // TODO Handle error
        });
    }

    private async handleMessage(ws: WebSocket, message: string): Promise<void> {
        logger.debug(`Received message: ${message}`);
        try {
            const gptResponse = await this.gptClient.getResponse(message);
            ws.send(gptResponse);
        } catch (error) {
            console.error("Error during GPT processing:", error);
            ws.send("An error occurred while processing your request.");
        }
    }

    private handleDisconnection(ws: WebSocket): void {
        logger.debug("Client disconnected");
        ws.send("Client disconnected");
    }

    close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}
