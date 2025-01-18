import { createLogger, transports, format } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, elapsed }) => {
      let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (elapsed) {
        logMessage += `\nElapsed: ${elapsed}`;
      }
      return logMessage;
    })
  ),
  transports: [
    new transports.Console(), // Logs to the terminal
    new transports.File({ filename: "logs/app.log" }), // Logs to a file
  ],
});

export default logger;
