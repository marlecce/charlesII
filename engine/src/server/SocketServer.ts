import WebSocket, { Server } from "ws";

export class SocketServer {
    private server: Server;

    constructor(port: number) {
        this.server = new WebSocket.Server({ port });
        this.server.on("connection", this.handleConnection.bind(this));
    }

    private handleConnection(ws: WebSocket): void {
        ws.on("message", this.handleMessage.bind(this, ws));
    }

    private handleMessage(ws: WebSocket, message: string): void {
        console.log(`Received message: ${message}`);
        ws.send(`Echo: ${message}`);
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
