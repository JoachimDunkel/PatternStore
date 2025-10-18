import * as vscode from 'vscode';
import { RegexPattern } from '../types';
import * as storage from '../storage';

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
  private handleMessage(message: any): void {
    console.log('Received message from webview:', message);
    
    switch (message.type) {
      case 'ready':
        // Webview is ready, send patterns
        this.sendPatterns();
        break;
      
      case 'delete':
        // TODO: Delete pattern
        break;
      
      case 'load':
        // TODO: Load pattern to search
        break;
      
      case 'save':
        // TODO: Save pattern changes
        break;
    }
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
  <style>
    body {
      padding: 0;
      margin: 0;
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
    }
    
    .container {
      display: flex;
      height: 100vh;
      gap: 1px;
      background: var(--vscode-panel-border);
    }
    
    /* Left panel - Pattern list */
    .pattern-list-panel {
      flex: 0 0 300px;
      background: var(--vscode-sideBar-background);
      display: flex;
      flex-direction: column;
    }
    
    .search-box {
      padding: 8px;
      background: var(--vscode-sideBar-background);
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .search-input {
      width: 100%;
      padding: 6px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
      font-size: 13px;
    }
    
    .pattern-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px;
    }
    
    .section-header {
      padding: 8px 12px;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      color: var(--vscode-foreground);
      opacity: 0.6;
      letter-spacing: 0.5px;
      margin-top: 8px;
    }
    
    .section-header:first-child {
      margin-top: 0;
    }
    
    .pattern-item {
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 3px;
      margin-bottom: 2px;
    }
    
    .pattern-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    
    .pattern-item.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    
    .pattern-name {
      font-weight: 500;
      margin-bottom: 2px;
    }
    
    .pattern-preview {
      font-size: 12px;
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* Right panel - Edit form */
    .edit-panel {
      flex: 1;
      background: var(--vscode-editor-background);
      overflow-y: auto;
      padding: 20px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 13px;
    }
    
    .form-input,
    .form-textarea {
      width: 100%;
      padding: 6px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
      font-size: 13px;
      font-family: var(--vscode-editor-font-family);
    }
    
    .form-textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .checkbox-group {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .button-group {
      display: flex;
      gap: 8px;
      margin-top: 20px;
    }
    
    button {
      padding: 6px 14px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
    }
    
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Left: Pattern List -->
    <div class="pattern-list-panel">
      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search patterns..."
          id="searchInput"
        />
      </div>
      <div class="pattern-list" id="patternList">
        <!-- Patterns will be inserted here -->
        <div class="empty-state">No patterns yet</div>
      </div>
    </div>
    
    <!-- Right: Edit Form -->
    <div class="edit-panel" id="editPanel">
      <h2>Edit Pattern</h2>
      
      <div class="form-group">
        <label class="form-label" for="labelInput">Name</label>
        <input type="text" class="form-input" id="labelInput" placeholder="Pattern name" />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="findInput">Find</label>
        <textarea class="form-textarea" id="findInput" placeholder="Search pattern or regex"></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="replaceInput">Replace (optional)</label>
        <textarea class="form-textarea" id="replaceInput" placeholder="Replacement text"></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Flags</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" id="isRegex" />
            <span>Regex</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="isCaseSensitive" />
            <span>Case Sensitive</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="matchWholeWord" />
            <span>Whole Word</span>
          </label>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="filesToInclude">Files to Include</label>
        <input type="text" class="form-input" id="filesToInclude" placeholder="*.ts,*.js or src/**" />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="filesToExclude">Files to Exclude</label>
        <input type="text" class="form-input" id="filesToExclude" placeholder="node_modules/**,dist/**" />
      </div>
      
      <div class="button-group">
        <button id="saveBtn">Save</button>
        <button id="deleteBtn" class="secondary">Delete</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    // Store patterns data
    let workspacePatterns = [];
    let userPatterns = [];
    
    // Listen for messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      
      if (message.type === 'patterns') {
        workspacePatterns = message.workspace;
        userPatterns = message.user;
        renderPatternList();
      }
    });
    
    /**
     * Render the pattern list grouped by scope
     */
    function renderPatternList() {
      const listContainer = document.getElementById('patternList');
      
      if (workspacePatterns.length === 0 && userPatterns.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No patterns yet</div>';
        return;
      }
      
      let html = '';
      
      // Workspace section
      if (workspacePatterns.length > 0) {
        html += '<div class="section-header">Workspace (' + workspacePatterns.length + ')</div>';
        workspacePatterns.forEach(pattern => {
          html += renderPatternItem(pattern);
        });
      }
      
      // User section
      if (userPatterns.length > 0) {
        html += '<div class="section-header">User (' + userPatterns.length + ')</div>';
        userPatterns.forEach(pattern => {
          html += renderPatternItem(pattern);
        });
      }
      
      listContainer.innerHTML = html;
    }
    
    /**
     * Render a single pattern item
     */
    function renderPatternItem(pattern) {
      const preview = pattern.find.substring(0, 40);
      const truncated = pattern.find.length > 40 ? '...' : '';
      
      return \`
        <div class="pattern-item" data-label="\${pattern.label}" data-scope="\${pattern.scope}">
          <div class="pattern-name">\${pattern.label}</div>
          <div class="pattern-preview">\${preview}\${truncated}</div>
        </div>
      \`;
    }
    
    // Send ready message to extension
    vscode.postMessage({ type: 'ready' });
  </script>
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
