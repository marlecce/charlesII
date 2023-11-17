import WebSocket from "ws";
import { SocketServer } from "../src/server/SocketServer";

describe("SocketServer", () => {
    let server: SocketServer;
    const port = 3001; // Use a different port for testing

    beforeAll(() => {
        server = new SocketServer(port);
    });

    afterAll(async () => {
        await server.close();
    });

    test("should echo messages", (done) => {
        const client = new WebSocket(`ws://localhost:${port}`);

        client.on("open", () => {
            client.send("Hello, server!");
        });

        client.on("message", (data) => {
            expect(data.toString()).toBe("Echo: Hello, server!");
            client.close();
            done();
        });
    });
});
