import WebSocket from "ws";
import { SocketServer } from "../src/server/SocketServer";
import { delay } from "../src/utils/Helpers";

const EXPECTED_GPT_OUTPUT = "Mocked GPT response";

jest.mock("../src/clients/GPTClient", () => {
    return {
        GPTClient: jest.fn().mockImplementation(() => {
            return {
                getResponse: jest.fn().mockResolvedValue(EXPECTED_GPT_OUTPUT)
            };
        })
    };
});

describe("SocketServer", () => {
    let server: SocketServer;
    const port = parseInt(process.env.SOCKET_SERVER_PORT || "");

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
            expect(data.toString()).toBe(EXPECTED_GPT_OUTPUT);
            client.close();

            await delay(500);
            done();
        });
    });
});
