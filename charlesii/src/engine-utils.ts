import { exec, spawn, ChildProcess, StdioOptions } from "child_process";
import * as path from "path";

let serverStarted = false;

function getEnginePath(): string {
  console.log("process.env.NODE_ENV: " + process.env.NODE_ENV);
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
    return path.resolve(__dirname, "../../engine");
  }

  return require.resolve("@charlesII/engine");
}

export function startEngine() {
  let args = ["run", "dev"];
  if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
    args = ["start"];
  }

  return new Promise<string>((resolve, reject) => {
    if (serverStarted) {
      resolve("The Engine is already running...");
    }

    const command = "npm";
    const options = {
      cwd: getEnginePath(),
      detached: true,
      stdio: ["ignore", "pipe", "pipe"] as StdioOptions,
    };

    const process: ChildProcess = spawn(command, args, options);

    process.on("error", (err) => {
      reject(`Error starting the engine server: ${err}`);
    });

    process.stdout?.on("data", (data) => {
      const output: string = data.toString("utf-8");

      if (
        output.includes('Application is running in "development"') ||
        output.includes("Process successfully started")
      ) {
        serverStarted = true;
        resolve("Engine server started");
      }
    });

    process.stderr?.on("data", (data) => {
      const output: string = data.toString("utf-8");
      reject(output);
    });

    process.unref();

    process.on("close", (code) => {
      if (code !== 0) {
        reject(`Engine server failed to start with code ${code}`);
      }
    });
  });
}

export function stopEngine() {
  const stopCommand = "npm stop";

  exec(stopCommand, { cwd: getEnginePath() }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping the engine server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log(`Engine server stopped: ${stdout}`);
  });
}

module.exports = { startEngine };
