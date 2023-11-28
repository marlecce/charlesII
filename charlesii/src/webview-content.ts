function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getWebviewContent(code: string) {
  const escapedCode = escapeHtml(code);

  return `
        <html>
        <head>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-javascript.min.js"></script>
            <style>
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
            <pre><code id="codeBlock" class="language-javascript">${escapedCode}</code></pre>

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
