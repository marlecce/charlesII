import WebSocket, { Server } from "ws";
import logger from "../utils/Logger";

export class SocketServer {
    private server: Server;

    constructor(port: number) {
        this.server = new WebSocket.Server({ port });
        this.server.on("connection", this.handleConnection.bind(this));
    }

    private handleConnection(ws: WebSocket): void {
        logger.debug("Client connected");

        ws.on("message", (message: string) => {
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

    private handleMessage(ws: WebSocket, message: string): void {
        logger.debug(`Received message: ${message}`);
        ws.send("The output from the model: hello there!");
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
