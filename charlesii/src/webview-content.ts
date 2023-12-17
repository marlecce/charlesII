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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        body {
          padding: 0;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .action-bar {
          position: sticky;
          top: 0;
          background-color: #282c34; 
          padding: 8px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
        }

        .action-buttons {
          display: flex;
          align-items: center;
        }

        .action-button {
          background-color: #007acc; 
          color: #fff;
          border: none;
          padding: 8px;
          margin: 5px;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
          display: flex;
          align-items: center;
        }

        .action-button i {
          margin-right: 5px;
        }

        .copy-button {
          background-color: #28a745;
          color: #fff;
          border: none;
          padding: 8px;
          margin: 5px;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
          display: flex;
          align-items: center;
        }

        .copy-button i {
          margin-right: 5px;
        }

        .copy-button:hover {
          background-color: #218838;
        }

        pre {
          margin: 0;
        }

        #codeBlock {
          padding: 16px;
          background-color: #1e1e1e;
          color: #d4d4d4;
          overflow-x: auto;
        }
      </style>
    </head>

    <body>
      <div class="action-bar">
        <div class="action-buttons">
          <button class="action-button" title="Improve Design" onclick="sendAction('improveDesign')"><i class="fas fa-magic"></i></button>
          <button class="action-button" title="Optimize Code" onclick="sendAction('optimizeCode')"><i class="fas fa-wrench"></i></button>
        </div>
        <button class="copy-button" title="Copy to Clipboard" onclick="copyCodeBlock()"><i class="far fa-copy"></i>Copy</button>
      </div>
      <pre><code id="codeBlock" class="language-javascript">${escapedCode}</code></pre>

      <script>
        const vscode = acquireVsCodeApi();

        function sendAction(action) {
          vscode.postMessage({
            command: action,
            code: "${escapedCode}"
          });
        }

        function copyCodeBlock() {
          const codeBlock = document.getElementById('codeBlock');
          const range = document.createRange();
          range.selectNode(codeBlock);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          document.execCommand('copy');
          window.getSelection().removeAllRanges();
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
