import * as vscode from 'vscode';
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
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manage Patterns</title>
  <link href="https://unpkg.com/@vscode/codicons/dist/codicon.css" rel="stylesheet" />
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
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
    }
    
    .section-header:hover {
      opacity: 0.8;
    }
    
    .section-header:first-child {
      margin-top: 0;
    }
    
    .section-header .codicon {
      font-size: 14px;
      transition: transform 0.1s ease;
    }
    
    .section-header.collapsed .codicon {
      transform: rotate(-90deg);
    }
    
    .section-content {
      max-height: 10000px;
      overflow: hidden;
      transition: max-height 0.15s ease;
    }
    
    .section-content.collapsed {
      max-height: 0;
    }
    
    .pattern-item {
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 3px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    
    .pattern-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    
    .pattern-item:hover .pattern-actions {
      opacity: 1;
    }
    
    .pattern-item.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    
    .pattern-info {
      flex: 1;
      min-width: 0;
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
    
    /* Action buttons */
    .pattern-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    
    .action-btn {
      padding: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--vscode-foreground);
      opacity: 0.7;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    
    .action-btn:hover {
      background: var(--vscode-toolbar-hoverBackground);
      opacity: 1;
    }
    
    .action-btn .codicon {
      font-size: 16px;
    }
    
    .action-btn.delete:hover {
      color: var(--vscode-errorForeground);
    }
    
    .action-btn.load:hover {
      color: var(--vscode-textLink-foreground);
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
    
    // Get collapse state from localStorage
    const getCollapseState = (section) => {
      const state = vscode.getState() || {};
      return state[section + '_collapsed'] === true;
    };
    
    // Save collapse state to localStorage
    const setCollapseState = (section, collapsed) => {
      const state = vscode.getState() || {};
      state[section + '_collapsed'] = collapsed;
      vscode.setState(state);
    };
    
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
        const collapsed = getCollapseState('workspace');
        html += renderSection('workspace', 'Workspace', workspacePatterns, collapsed);
      }
      
      // User section
      if (userPatterns.length > 0) {
        const collapsed = getCollapseState('user');
        html += renderSection('user', 'User', userPatterns, collapsed);
      }
      
      listContainer.innerHTML = html;
      
      // Attach click handlers to section headers
      document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', toggleSection);
      });
      
      // Attach event listeners to pattern items and action buttons
      attachEventListeners();
    }
    
    /**
     * Render a collapsible section
     */
    function renderSection(id, title, patterns, collapsed) {
      const chevron = collapsed ? 'codicon-chevron-right' : 'codicon-chevron-down';
      const contentClass = collapsed ? 'section-content collapsed' : 'section-content';
      
      let html = \`
        <div class="section-header \${collapsed ? 'collapsed' : ''}" data-section="\${id}">
          <i class="codicon \${chevron}"></i>
          <span>\${title} (\${patterns.length})</span>
        </div>
        <div class="\${contentClass}" data-section-content="\${id}">
      \`;
      
      patterns.forEach(pattern => {
        html += renderPatternItem(pattern);
      });
      
      html += '</div>';
      return html;
    }
    
    /**
     * Toggle section collapsed state
     */
    function toggleSection(event) {
      const header = event.currentTarget;
      const sectionId = header.dataset.section;
      const content = document.querySelector('[data-section-content="' + sectionId + '"]');
      const chevron = header.querySelector('.codicon');
      
      // Toggle collapsed state
      const isCollapsed = header.classList.contains('collapsed');
      
      if (isCollapsed) {
        // Expand
        header.classList.remove('collapsed');
        content.classList.remove('collapsed');
        chevron.classList.remove('codicon-chevron-right');
        chevron.classList.add('codicon-chevron-down');
        setCollapseState(sectionId, false);
      } else {
        // Collapse
        header.classList.add('collapsed');
        content.classList.add('collapsed');
        chevron.classList.remove('codicon-chevron-down');
        chevron.classList.add('codicon-chevron-right');
        setCollapseState(sectionId, true);
      }
    }
    
    /**
     * Render a single pattern item
     */
    function renderPatternItem(pattern) {
      const preview = pattern.find.substring(0, 40);
      const truncated = pattern.find.length > 40 ? '...' : '';
      
      return \`
        <div class="pattern-item" data-label="\${pattern.label}" data-scope="\${pattern.scope}">
          <div class="pattern-info">
            <div class="pattern-name">\${pattern.label}</div>
            <div class="pattern-preview">\${preview}\${truncated}</div>
          </div>
          <div class="pattern-actions">
            \${renderActionButton('trash', 'delete', 'Delete pattern')}
            \${renderActionButton('arrow-right', 'load', 'Load to search')}
          </div>
        </div>
      \`;
    }
    
    /**
     * Reusable action button component
     */
    function renderActionButton(icon, action, title) {
      return \`
        <button class="action-btn \${action}" 
                data-action="\${action}" 
                title="\${title}"
                onclick="event.stopPropagation()">
          <i class="codicon codicon-\${icon}"></i>
        </button>
      \`;
    }
    
    // Attach event listeners after initial render
    function attachEventListeners() {
      // Pattern item clicks (for selection/viewing)
      document.querySelectorAll('.pattern-item').forEach(item => {
        item.addEventListener('click', handlePatternClick);
      });
      
      // Action button clicks
      document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionClick);
      });
    }
    
    /**
     * Handle pattern item click (for future: show in details panel)
     */
    function handlePatternClick(event) {
      const item = event.currentTarget;
      const label = item.dataset.label;
      const scope = item.dataset.scope;
      
      // Remove previous selection
      document.querySelectorAll('.pattern-item').forEach(i => {
        i.classList.remove('selected');
      });
      
      // Select this item
      item.classList.add('selected');
      
      // TODO: Load pattern details into right panel
      console.log('Selected pattern:', label, scope);
    }
    
    /**
     * Handle action button clicks (delete, load)
     */
    function handleActionClick(event) {
      event.stopPropagation();
      
      const button = event.currentTarget;
      const action = button.dataset.action;
      const item = button.closest('.pattern-item');
      const label = item.dataset.label;
      const scope = item.dataset.scope;
      
      if (action === 'delete') {
        handleDelete(label, scope);
      } else if (action === 'load') {
        handleLoad(label, scope);
      }
    }
    
    /**
     * Handle delete action
     */
    function handleDelete(label, scope) {
      // Send delete request to extension
      vscode.postMessage({
        type: 'delete',
        label: label,
        scope: scope
      });
    }
    
    /**
     * Handle load action
     */
    function handleLoad(label, scope) {
      // Send load request to extension
      vscode.postMessage({
        type: 'load',
        label: label,
        scope: scope
      });
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
