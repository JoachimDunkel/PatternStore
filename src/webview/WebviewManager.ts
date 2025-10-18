import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { RegexPattern } from '../types';
import * as storage from '../storage';
import * as searchCtx from '../searchCtx';

/**
 * Manages the webview panel for pattern management
 */
export class WebviewManager {
  private static currentPanel: WebviewManager | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly scope: 'global' | 'workspace';
  private readonly extensionUri: vscode.Uri;
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
    this.extensionUri = extensionUri;
    this.scope = scope;

    // Set initial HTML content
    this.panel.webview.html = this.getHtmlContent();

    // Listen for when the panel is disposed
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        this.handleMessage(message);
      },
      null,
      this.disposables
    );

    // Send initial pattern data to webview
    this.sendPatterns();
  }

  /**
   * Load patterns from storage and send to webview
   */
  private sendPatterns(): void {
    const allPatterns = storage.getAllPatterns();
    
    // Group patterns by scope
    const workspacePatterns = allPatterns.filter(p => p.scope === 'workspace');
    const userPatterns = allPatterns.filter(p => p.scope === 'global');
    
    this.panel.webview.postMessage({
      type: 'patterns',
      workspace: workspacePatterns,
      user: userPatterns
    });
  }

  /**
   * Handle messages from the webview
   */
  private async handleMessage(message: any): Promise<void> {
    console.log('Received message from webview:', message);
    
    switch (message.type) {
      case 'ready':
        // Webview is ready, send patterns
        this.sendPatterns();
        break;
      
      case 'delete':
        await this.handleDelete(message.label, message.scope);
        break;
      
      case 'load':
        await this.handleLoad(message.label, message.scope);
        break;
      
      case 'save':
        // TODO: Save pattern changes
        break;
    }
  }

  /**
   * Handle delete pattern request from webview
   */
  private async handleDelete(label: string, scope: 'global' | 'workspace'): Promise<void> {
    // Confirm deletion
    const confirm = await vscode.window.showWarningMessage(
      `Delete pattern "${label}"?`,
      { modal: true },
      'Delete'
    );
    
    if (confirm === 'Delete') {
      await storage.deletePattern(label, scope);
      // Refresh pattern list
      this.sendPatterns();
    }
  }

  /**
   * Handle load pattern request from webview
   */
  private async handleLoad(label: string, scope: 'global' | 'workspace'): Promise<void> {
    // Find the pattern
    const allPatterns = storage.getAllPatterns();
    const pattern = allPatterns.find(p => p.label === label && p.scope === scope);
    
    if (!pattern) {
      vscode.window.showErrorMessage(`Pattern "${label}" not found`);
      return;
    }
    
    // Load into search
    await searchCtx.loadPatternIntoSearch(pattern);
    
    // Close the webview
    this.panel.dispose();
  }

  /**
   * Get the HTML content for the webview
   */
  private getHtmlContent(): string {
    // Generate nonce for CSP
    const nonce = this.getNonce();
    
    // Get URIs for webview resources
    const cspSource = this.panel.webview.cspSource;
    
    // Load HTML, CSS, and JS from files
    const htmlPath = path.join(this.extensionUri.fsPath, 'src', 'webview', 'html', 'patternManager.html');
    const cssPath = path.join(this.extensionUri.fsPath, 'src', 'webview', 'css', 'patternManager.css');
    const jsPath = path.join(this.extensionUri.fsPath, 'src', 'webview', 'js', 'patternManager.js');
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');
    const js = fs.readFileSync(jsPath, 'utf8');
    
    // Build style tag with nonce
    const styleTag = `<style nonce="${nonce}">\n${css}\n  </style>`;
    
    // Replace placeholders
    html = html.replace(/{{nonce}}/g, nonce);
    html = html.replace(/{{cspSource}}/g, cspSource);
    html = html.replace(/{{styleTag}}/g, styleTag);
    html = html.replace(/{{script}}/g, js);
    
    return html;
  }

  /**
   * Generate a nonce for CSP
   */
  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
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
