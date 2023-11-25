import logger from "./utils/Logger";
import path from "path";
import dotenv from "dotenv";

// Determine which .env file to load
const envPath = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: path.resolve(process.cwd(), envPath) });

import { Config } from "./Config";
import { SocketServer } from "./server/SocketServer";

function handleError(error: unknown, socketServer: SocketServer | null) {
    if (error instanceof Error) {
        logger.error(error.message);
    } else {
        logger.error("An unexpected error occurred");
    }

    if (socketServer) {
        socketServer
            .close()
            .then(() => {
                process.exit(1);
            })
            .catch((shutdownError) => {
                logger.error(`Failed to shut down socket server: ${shutdownError}`);
                process.exit(1);
            });
    } else {
        process.exit(1);
    }
}

function run() {
    let socketServer: SocketServer | null = null;

    try {
        const config = new Config();
        socketServer = new SocketServer(config.socketServerPort);
        logger.info(`Application is running in "${config.nodeEnv}" on port ${config.socketServerPort}!`);

        // Listing the termination signals
        process.on("SIGINT", () => handleError(new Error("SIGINT received"), socketServer));
        process.on("SIGTERM", () => handleError(new Error("SIGTERM received"), socketServer));
    } catch (error) {
        handleError(error, socketServer);
    }
}

run();
