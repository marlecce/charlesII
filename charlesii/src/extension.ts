import * as vscode from "vscode";
import WebSocket from "ws";
import { getWebviewContent } from "./webview-content";
import { startEngine, stopEngine } from "./engine-utils";

const SOCKET_SERVER_URL = "ws://localhost:3006";

let clientSocket: WebSocket | null = null;
let currentPanel: vscode.WebviewPanel | undefined = undefined;

interface WebviewMessage {
  command: string;
  code?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setupClientWebSocket(context: vscode.ExtensionContext): WebSocket {
  if (!clientSocket) {
    clientSocket = new WebSocket(SOCKET_SERVER_URL);

    clientSocket.on("open", () => {
      console.log("WebSocket connection opened");
    });

    clientSocket.on("error", (error) =>
      console.error(`WebSocket error: ${error.message}`)
    );

    clientSocket.on("close", () => {
      console.log("WebSocket connection closed");
      clientSocket = null;
    });

    clientSocket.on("message", (data: string) => {
      const response = data.toString();
      updateContent(response, context);
    });
  }

  return clientSocket;
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
  // Gestisce i messaggi ricevuti dalla webview
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
  try {
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
              await sleep(300);

              const clientSocket = setupClientWebSocket(context);
              await sleep(300);

              sendCodeToEngine(clientSocket, codeToSend);
            })
            .catch((error) => {
              console.error(error);
              throw error;
            });
        }
      }
    );

    context.subscriptions.push(disposable);
  } catch (error) {
    vscode.window.showErrorMessage(`Engine could not be started: ${error}`);
    return;
  }
}

export function deactivate(clientSocket: WebSocket) {
  stopEngine();
  if (clientSocket) {
    clientSocket.close();
  }
}
