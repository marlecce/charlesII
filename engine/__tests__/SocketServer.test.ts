import WebSocket from "ws";
import { SocketServer } from "../src/server/SocketServer";
import { delay } from "../src/utils/Helpers";

describe("SocketServer", () => {
    let server: SocketServer;
    const port = 3001;

    beforeAll(() => {
        server = new SocketServer(port);
    });

    afterAll(async () => {
        await server.close();
    });

    it("should establish a connection with the server", (done) => {
        const client = new WebSocket(`ws://localhost:${port}`);

        client.on("open", () => {
            expect(client.readyState).toBe(WebSocket.OPEN);
            client.close();
            done();
        });
    });

    it("should handle client disconnection", (done) => {
        const client = new WebSocket(`ws://localhost:${port}`);

        client.on("open", () => {
            client.close();
        });

        client.on("close", () => {
            done();
        });
    });

    it("should respond correctly to a specific client message", (done) => {
        const client = new WebSocket(`ws://localhost:${port}`);

        client.on("open", () => {
            client.send("Specific message");
        });

        client.on("message", async (data) => {
            expect(data.toString()).toBe("The output from the model: hello there!");
            client.close();

            await delay(500);
            done();
        });
    });
});
