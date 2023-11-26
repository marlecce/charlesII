// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";
import WebSocket from "ws";

interface WebviewMessage {
  command: string;
  code?: string;
}

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

function getWebviewContent(initialCode: string) {
  function escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return `
        <html>
        <head>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-javascript.min.js"></script>
            <style>
                /* Aggiungi ulteriori stili qui */
                body {
                    padding: 0;
                    margin: 0;
                }
                .action-bar {
                    position: sticky;
                    top: 0;
                    background-color: white;
                    padding: 10px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="action-bar">
                <button onclick="sendAction('improveDesign')">Improve Design</button>
                <button onclick="sendAction('optimizeCode')">Optimize Code</button>
                <input type="text" id="codeInput" placeholder="Type your code here">
                <button onclick="sendCode()">Send</button>
            </div>
            <pre><code id="codeBlock" class="language-javascript">${escapeHtml(
              initialCode
            )}</code></pre>

            <script>
                const vscode = acquireVsCodeApi();
                
                function sendAction(action) {
                    vscode.postMessage({
                        command: action
                    });
                }

                function sendCode() {
                    const code = document.getElementById('codeInput').value;
                    vscode.postMessage({
                        command: 'sendCode',
                        code: code
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateCode':
                            const codeBlock = document.getElementById('codeBlock');
                            codeBlock.textContent = message.code;
                            Prism.highlightElement(codeBlock);
                            break;
                    }
                });
            </script>
        </body>
        </html>
    `;
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
        const codeToSend = editor.document.getText(editor.selection);

        const ws = new WebSocket("ws://localhost:3006");
        ws.on("open", function open() {
          ws.send(codeToSend);
        });

        ws.on("message", function incoming(data: string) {
          const responseCode = data.toString();

          const panel = vscode.window.createWebviewPanel(
            "codeActions",
            "Code Actions",
            vscode.ViewColumn.Beside,
            {
              enableScripts: true,
            }
          );

          panel.webview.html = getWebviewContent(responseCode);

          panel.webview.onDidReceiveMessage(
            (message) => {
              handleWebviewMessage(message, panel.webview);
            },
            undefined,
            context.subscriptions
          );
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

function handleWebviewMessage(
  message: WebviewMessage,
  webview: vscode.Webview
) {
  switch (message.command) {
    case "improveDesign":
      // Logica per "Improve Design"
      break;
    case "optimizeCode":
      // Logica per "Optimize Code"
      break;
    case "sendCode":
      // Invia codice al WebSocket e gestisci la risposta
      sendCodeToWebSocket(message.code, webview);
      break;
  }
}

function sendCodeToWebSocket(
  code: string | undefined,
  webview: vscode.Webview
) {
  const ws = new WebSocket("ws://localhost:3006");
  ws.on("open", function open() {
    if (code) {
      ws.send(code);
    } else {
      console.error("Attempted to send undefined code");
    }
  });

  ws.on("message", function incoming(data: string) {
    webview.postMessage({ command: "updateCode", code: data.toString() });
  });
}
// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  stopEngine(context);
}
