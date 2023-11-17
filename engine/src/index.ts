import logger from "./utils/Logger";
import path from "path";
import dotenv from "dotenv";

// Determine which .env file to load
const envPath = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: path.resolve(process.cwd(), envPath) });

import { Config } from "./Config";

function handleError(error: unknown) {
    if (error instanceof Error) {
        logger.error(error.message);
    } else {
        logger.error("An unexpected error occurred");
    }
    process.exit(1);
}

function run() {
    try {
        const config = new Config();
        logger.info(`Application is running in "${config.nodeEnv}"!`);
    } catch (error) {
        handleError(error);
    }
}

run();
