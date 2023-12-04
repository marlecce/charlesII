import { exec, spawn, ChildProcess, StdioOptions } from "child_process";
import * as path from "path";

let serverStarted = false;

function getEnginePath(): string {
  return path.resolve(__dirname, "../../engine");
}

export function startEngine() {
  return new Promise<string>((resolve, reject) => {
    if (serverStarted) {
      resolve("The Engine is already running...");
    }

    const command = "npm";
    const args = ["start"];
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

      if (output.includes("Process successfully started")) {
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
