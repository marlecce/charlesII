// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";
import WebSocket from "ws";

function startEngine(context: vscode.ExtensionContext) {
  const enginePath = path.join(context.extensionPath, "../../engine");
  const startCommand = "npm run start:prod";

  exec(startCommand, { cwd: enginePath }, (error, stdout, stderr) => {
    if (error) {
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

function stopEngine(context: vscode.ExtensionContext) {
  const enginePath = path.join(context.extensionPath, "../engine");
  const stopCommand = "npm stop";

  exec(stopCommand, { cwd: enginePath }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Errore nell'arresto del server engine: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Errore: ${stderr}`);
      return;
    }
    console.log(`Server engine arrestato: ${stdout}`);
  });
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  startEngine(context);

  let disposable = vscode.commands.registerCommand(
    "extension.optimizeWithCharlesII",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const text = editor.document.getText(editor.selection);

        const ws = new WebSocket("ws://localhost:3006");
        ws.on("open", function open() {
          ws.send(text);
        });

        ws.on("message", function incoming(data: string) {
          vscode.workspace
            .openTextDocument({
              content: data.toString(),
              language: "javascript",
            })
            .then((doc) =>
              vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.Beside,
              })
            );
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  stopEngine(context);
}
