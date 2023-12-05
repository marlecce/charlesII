import * as vscode from "vscode";
import WebSocket from "ws";
import { getWebviewContent } from "./webview-content";
import { startEngine, stopEngine } from "./engine-utils";

const SOCKET_SERVER_URL = "ws://localhost:3006";
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_INTERVAL = 50;

let clientSocket: WebSocket | null = null;
let currentPanel: vscode.WebviewPanel | undefined = undefined;

interface WebviewMessage {
  command: string;
  code?: string;
}

function setupClientWebSocket(
  context: vscode.ExtensionContext
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      if (clientSocket) {
        resolve(clientSocket);
        return;
      }

      let retryAttempts = 0;
      let connecting = false;

      function tryConnect() {
        if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
          reject(
            new Error("WebSocket connection failed after multiple attempts.")
          );
          return;
        }

        if (connecting) {
          return;
        }

        connecting = true;

        clientSocket = new WebSocket(SOCKET_SERVER_URL);

        clientSocket.on("open", () => {
          console.log("WebSocket connection opened");
          connecting = false;
          resolve(clientSocket!);
        });

        clientSocket.on("error", (error) => {
          console.error(`WebSocket error: ${error.message}`);
          connecting = false;
          retryAttempts++;
          setTimeout(tryConnect, RETRY_INTERVAL);
        });

        clientSocket.on("close", () => {
          console.log("WebSocket connection closed");
          clientSocket = null;
          connecting = false;
          retryAttempts++;
          setTimeout(tryConnect, RETRY_INTERVAL);
        });

        clientSocket.on("message", (data: string) => {
          const response = data.toString();
          updateContent(response, context);
        });
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Connecting to the Engine...",
        },
        async () => {
          tryConnect();
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

function updateContent(content: string, context: vscode.ExtensionContext) {
  if (currentPanel) {
    currentPanel.webview.postMessage({
      command: "updateCode",
      code: content,
    });
  } else {
    currentPanel = createWebView(context);
    currentPanel.webview.html = getWebviewContent(content);
  }
}

function createWebView(context: vscode.ExtensionContext): vscode.WebviewPanel {
  let webviewPanel = vscode.window.createWebviewPanel(
    "codeActions",
    "Code Actions",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  webviewPanel.webview.html = getWebviewContent("Loading...");

  webviewPanel.onDidDispose(
    () => {
      currentPanel = undefined;
    },
    null,
    context.subscriptions
  );

  //  currentPanel.webview.onDidReceiveMessage(
  //    (message) => {
  //      handleWebviewMessage(message, currentPanel.webview);
  //    },
  //    undefined,
  //    context.subscriptions
  //  );

  return webviewPanel;
}

function handleWebviewMessage(
  message: WebviewMessage,
  webview: vscode.Webview
) {
  // handle the massages from the webview
  // ...
}

function sendCodeToEngine(clientSocket: WebSocket, code: string | undefined) {
  if (!code) {
    console.error("Attempted to send undefined code");
    return;
  }

  clientSocket.send(code);
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.optimizeWithCharlesII",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const codeToSend = editor.document.getText(editor.selection);
        console.log("Code to send:", codeToSend);

        startEngine()
          .then(async (result) => {
            console.log(result);

            const clientSocket = await setupClientWebSocket(context);

            sendCodeToEngine(clientSocket, codeToSend);
          })
          .catch((error) => {
            vscode.window.showErrorMessage(
              `Engine could not be started: ${error}`
            );
            return;
          });
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(clientSocket: WebSocket) {
  stopEngine();
  if (clientSocket?.readyState === WebSocket.OPEN) {
    clientSocket.close();
  }
}
