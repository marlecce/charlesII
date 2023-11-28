import { exec } from "child_process";

export function startEngine(enginePath: string) {
  const startCommand = "npm start";
  exec(startCommand, { cwd: enginePath }, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      console.error(`Error during server engine setup: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log(`Server engine running: ${stdout}`);
  });
}

export function stopEngine(enginePath: string) {
  const stopCommand = "npm stop";

  exec(stopCommand, { cwd: enginePath }, (error, stdout, stderr) => {
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
