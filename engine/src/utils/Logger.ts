import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const dailyRotateTransport = new DailyRotateFile({
    filename: "application-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d"
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
    transports: [
        dailyRotateTransport,
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" })
    ],
    exceptionHandlers: [new winston.transports.File({ filename: "exceptions.log" })]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple()
        })
    );
}

export default logger;
