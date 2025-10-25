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

    const panel = vscode.window.createWebviewPanel(
      'patternStoreManage',
      'PatternStore',
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

    this.sendPatterns();
  }

  private sendPatterns(selectId?: string, selectScope?: 'global' | 'workspace'): void {
    const allPatterns = storage.getAllPatterns();

    const workspacePatterns = allPatterns.filter(p => p.scope === 'workspace');
    const userPatterns = allPatterns.filter(p => p.scope === 'global');

    const message: any = {
      type: 'patterns',
      workspace: workspacePatterns,
      user: userPatterns
    };

    if (selectId && selectScope) {
      message.selectPattern = {
        id: selectId,
        scope: selectScope
      };
    }

    this.panel.webview.postMessage(message);
  }

  private async handleMessage(message: any): Promise<void> {
    console.log('Received message from webview:', message);

    switch (message.type) {
      case 'ready':
        // Webview is ready, send patterns
        this.sendPatterns();
        break;

      case 'delete':
        await this.handleDelete(message.id, message.scope);
        break;

      case 'load':
        await this.handleLoad(message.id, message.scope, message.pattern);
        break;

      case 'create':
        await this.handleCreate(message.scope);
        break;

      case 'save':
        await this.handleSave(message.pattern);
        break;
    }
  }

  private async handleCreate(scope: 'global' | 'workspace'): Promise<void> {
    // Generate unique label for new pattern
    const existingPatterns = storage.getAllPatterns().filter(p => p.scope === scope);
    const baseName = 'New Pattern';
    let label = baseName;
    let counter = 1;

    while (existingPatterns.some(p => p.label === label)) {
      counter++;
      label = `${baseName} ${counter}`;
    }

    const newPattern: RegexPattern = {
      label: label,
      find: '',
      replace: '',
      flags: {
        isRegex: false,
        isCaseSensitive: false,
        matchWholeWord: false,
        isMultiline: false
      },
      scope: scope
    };

    await storage.savePattern(newPattern);
    this.sendPatterns(newPattern.id, newPattern.scope);
  }


  private async handleSave(patternData: any): Promise<void> {
    const { id, label, find, replace, flags, filesToInclude, filesToExclude, scope } = patternData;

    const pattern: RegexPattern = {
      id: id,  // Preserve existing ID
      label: label,
      find: find,
      replace: replace,
      flags: flags,
      filesToInclude: filesToInclude,
      filesToExclude: filesToExclude,
      scope: scope
    };

    await storage.savePattern(pattern);

    this.sendPatterns(id, scope);
  }

  private async handleDelete(id: string, scope: 'global' | 'workspace'): Promise<void> {
    // Find pattern to get label for confirmation
    const allPatterns = storage.getAllPatterns();
    const pattern = allPatterns.find(p => p.id === id && p.scope === scope);

    if (!pattern) {
      vscode.window.showErrorMessage(`Pattern not found`);
      return;
    }

    // Confirm deletion
    const confirm = await vscode.window.showWarningMessage(
      `Delete pattern "${pattern.label}"?`,
      { modal: true },
      'Delete'
    );

    if (confirm === 'Delete') {
      await storage.deletePattern(id, scope);
      // Refresh pattern list
      this.sendPatterns();
    }
  }

  private async handleLoad(id: string, scope: 'global' | 'workspace', providedPattern?: any): Promise<void> {
    let pattern = providedPattern;

    // If no pattern was provided, look it up
    if (!pattern) {
      const allPatterns = storage.getAllPatterns();
      pattern = allPatterns.find(p => p.id === id && p.scope === scope);
      if (!pattern) {
        vscode.window.showErrorMessage(`Pattern "${id}" not found`);
        return;
      }
    }

    await searchCtx.loadPatternIntoSearch(pattern);
  }


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
