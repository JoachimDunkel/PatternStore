import * as vscode from 'vscode';
import { RegexPattern } from '../types';

/**
 * Manages the webview panel for pattern management
 */
export class WebviewManager {
  private static currentPanel: WebviewManager | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly scope: 'global' | 'workspace';
  private disposables: vscode.Disposable[] = [];

  /**
   * Create or show the webview panel
   */
  public static show(extensionUri: vscode.Uri, scope: 'global' | 'workspace') {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (WebviewManager.currentPanel) {
      WebviewManager.currentPanel.panel.reveal(column);
      return;
    }

    // Create a new panel
    const panel = vscode.window.createWebviewPanel(
      'patternStoreManage',
      scope === 'global' ? 'Manage User Patterns' : 'Manage Workspace Patterns',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    WebviewManager.currentPanel = new WebviewManager(panel, extensionUri, scope);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    scope: 'global' | 'workspace'
  ) {
    this.panel = panel;
    this.scope = scope;

    // Set initial HTML content
    this.panel.webview.html = this.getHtmlContent();

    // Listen for when the panel is disposed
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        console.log('Received message from webview:', message);
      },
      null,
      this.disposables
    );
  }

  /**
   * Get the HTML content for the webview
   */
  private getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manage Patterns</title>
</head>
<body>
  <h1>Manage ${this.scope === 'global' ? 'User' : 'Workspace'} Patterns</h1>
  <p>Webview is working! 🎉</p>
</body>
</html>`;
  }

  /**
   * Clean up resources
   */
  public dispose() {
    WebviewManager.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
