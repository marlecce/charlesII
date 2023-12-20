import * as vscode from "vscode";
import WebSocket from "ws";
import { getWebviewContent } from "./webview-content";
import { GPTClient } from "./GPTClient";
import { EXTENSION_NAME } from "./constants";

let gptClient: GPTClient | null = null;
let currentPanel: vscode.WebviewPanel | undefined = undefined;

interface WebviewMessage {
  command: string;
  code?: string;
}

function updateProgressIndicator(message: string) {
  if (currentPanel) {
    currentPanel.webview.postMessage({
      command: "updateProgressIndicator",
      message,
    });
  }
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
    EXTENSION_NAME,
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

  webviewPanel.webview.onDidReceiveMessage(
    (message) => {
      handleWebviewMessage(message, context);
    },
    undefined,
    context.subscriptions
  );

  return webviewPanel;
}

function getRicherPrompt(command: string, codeToSend: string) {
  if (!codeToSend) throw new Error("Code to send is empty!");

  switch (command) {
    case "improveDesign":
      return `Acting as a senior developer, can you improve the design of the following code: ${codeToSend}`;
    case "optimizeCode":
      return `Acting as a senior developer, can you optimize the following code: ${codeToSend}`;

    default:
      `Improve the following code: ${codeToSend}`;
      break;
  }
}

function handleWebviewMessage(
  message: WebviewMessage,
  context: vscode.ExtensionContext
) {
  try {
    if (!message || !message.code) throw new Error("No code to send!");

    const richerPrompt = getRicherPrompt(message.command, message.code);

    updateProgressIndicator("Analyzing code...");

    if (!gptClient) {
      throw new Error("GPTClient not initialized");
    }

    gptClient
      .getResponse(richerPrompt!)
      .then(async (response) => {
        console.log(response);

        updateContent(response, context);
      })
      .catch((error) => {
        vscode.window.showErrorMessage(`Client failed: ${error}`);
      });
  } catch (error) {
    vscode.window.showErrorMessage(`Unable to update the output: ${error}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.optimizeWithCharlesII",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const codeToSend = editor.document.getText(editor.selection);

        if (!gptClient) {
          const apiKey = vscode.workspace
            .getConfiguration("yourExtensionName")
            .get("openai.apiKey") as string;

          gptClient = new GPTClient(apiKey);
        }

        updateProgressIndicator("Analyzing code...");

        gptClient
          .getResponse(codeToSend)
          .then(async (response) => {
            console.log(response);

            updateContent(response, context);
          })
          .catch((error) => {
            vscode.window.showErrorMessage(
              `Engine could not be started: ${error}`
            );
          });
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(clientSocket: WebSocket) {}
