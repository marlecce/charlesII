import * as vscode from "vscode";
import * as path from "path";
import WebSocket from "ws";
import { getWebviewContent } from "./webview-content";
import { startEngine, stopEngine } from "./engine-utils";

const SOCKET_SERVER_URL = "ws://localhost:3006";
const ENGINE_PATH = path.resolve(__dirname, "../../engine");

let globalWebSocket: WebSocket | null = null;
let currentPanel: vscode.WebviewPanel | undefined = undefined;
let messageQueue: string[] = [];

interface WebviewMessage {
  command: string;
  code?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setupClientWebSocket(context: vscode.ExtensionContext) {
  globalWebSocket = new WebSocket(SOCKET_SERVER_URL);
  globalWebSocket.on("open", () => {
    console.log("WebSocket connection opened");

    while (messageQueue.length > 0) {
      const messageToSend = messageQueue.shift();
      if (messageToSend) {
        globalWebSocket?.send(messageToSend);
      }
    }
  });
  globalWebSocket.on("error", (error) =>
    console.error(`WebSocket error: ${error.message}`)
  );
  globalWebSocket.on("close", () => {
    console.log("WebSocket connection closed");
    globalWebSocket = null;
  });

  globalWebSocket.on("message", (data: string) => {
    const response = data.toString();
    updateContent(response, context);
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

export async function activate(context: vscode.ExtensionContext) {
  startEngine(ENGINE_PATH);
  await sleep(3000);
  try {
    console.log("Engine is now ready to use.");

    setupClientWebSocket(context);

    let disposable = vscode.commands.registerCommand(
      "extension.optimizeWithCharlesII",
      () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const codeToSend = editor.document.getText(editor.selection);

          if (!currentPanel) {
            currentPanel = createWebView(context);
          }

          sendCodeToWebSocket(codeToSend);
        }
      }
    );

    context.subscriptions.push(disposable);
  } catch (error) {
    vscode.window.showErrorMessage(`Engine could not be started: ${error}`);
    return;
  }
}

function handleWebviewMessage(
  message: WebviewMessage,
  webview: vscode.Webview
) {
  // Gestisce i messaggi ricevuti dalla webview
  // ...
}

async function sendCodeToWebSocket(code: string | undefined) {
  if (!code) {
    console.error("Attempted to send undefined code");
    return;
  }

  await waitForWebSocketToConnect(globalWebSocket);

  globalWebSocket?.send(code);
}

function waitForWebSocketToConnect(webSocket: WebSocket | null): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxWaitTime = 5000;
    const checkInterval = 100;

    let waitedTime = 0;
    const interval = setInterval(() => {
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        clearInterval(interval);
        resolve();
      } else if (waitedTime >= maxWaitTime) {
        clearInterval(interval);
        reject(new Error("WebSocket connection timeout"));
      } else {
        waitedTime += checkInterval;
      }
    }, checkInterval);
  });
}

export function deactivate(context: vscode.ExtensionContext) {
  stopEngine(ENGINE_PATH);
  if (globalWebSocket) {
    globalWebSocket.close();
  }
}
