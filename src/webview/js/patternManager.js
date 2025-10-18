const vscode = acquireVsCodeApi();

// Store patterns data
let workspacePatterns = [];
let userPatterns = [];
let searchQuery = '';

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
    setupSearchInput();
    
    // Focus search input when webview opens
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

/**
 * Setup search input event listener
 */
function setupSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  
  if (!searchInput || !searchClear) return;
  
  // Update search query and show/hide clear button
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    
    // Show/hide clear button
    if (searchQuery) {
      searchClear.classList.add('visible');
    } else {
      searchClear.classList.remove('visible');
    }
    
    renderPatternList();
  });
  
  // Clear button click
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.remove('visible');
    renderPatternList();
    searchInput.focus();
  });
  
  // ESC key to clear search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchQuery) {
      searchInput.value = '';
      searchQuery = '';
      searchClear.classList.remove('visible');
      renderPatternList();
    }
  });
}

/**
 * Filter patterns based on search query
 */
function filterPatterns(patterns) {
  if (!searchQuery) return patterns;
  
  return patterns.filter(pattern => {
    const nameMatch = pattern.label.toLowerCase().includes(searchQuery);
    const findMatch = pattern.find.toLowerCase().includes(searchQuery);
    const replaceMatch = pattern.replace && pattern.replace.toLowerCase().includes(searchQuery);
    return nameMatch || findMatch || replaceMatch;
  });
}

/**
 * Render the pattern list (all patterns combined)
 */
function renderPatternList() {
  const listContainer = document.getElementById('patternList');
  
  // Combine all patterns
  const allPatterns = [...workspacePatterns, ...userPatterns];
  
  // Apply search filter
  const filteredPatterns = filterPatterns(allPatterns);

  if (filteredPatterns.length === 0) {
    if (searchQuery) {
      listContainer.innerHTML = '<div class="empty-state">No patterns found</div>';
    } else {
      listContainer.innerHTML = '<div class="empty-state">No patterns yet</div>';
    }
    return;
  }

  let html = '';
  
  // Render all patterns in a single list
  filteredPatterns.forEach(pattern => {
    html += renderPatternItem(pattern);
  });
  
  listContainer.innerHTML = html;
  
  // Attach event listeners to pattern items and action buttons
  attachEventListeners();
}



/**
 * Render a single pattern item
 */
function renderPatternItem(pattern) {
  const preview = pattern.find.substring(0, 40);
  const truncated = pattern.find.length > 40 ? '...' : '';
  
  return `
    <div class="pattern-item" data-label="${pattern.label}" data-scope="${pattern.scope}">
      <div class="pattern-info">
        <div class="pattern-name">${pattern.label}</div>
        <div class="pattern-preview">${preview}${truncated}</div>
      </div>
      <div class="pattern-actions">
        ${renderActionButton('trash', 'delete', 'Delete pattern')}
        ${renderActionButton('arrow-right', 'load', 'Load to search')}
      </div>
    </div>
  `;
}

/**
 * Reusable action button component
 */
function renderActionButton(icon, action, title) {
  return `
    <button class="action-btn ${action}" 
            data-action="${action}" 
            title="${title}"
            onclick="event.stopPropagation()">
      <i class="codicon codicon-${icon}"></i>
    </button>
  `;
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

// Helper function to populate the edit panel with pattern data
function populatePatternDetails(pattern) {
  // Populate form inputs
  const labelInput = document.getElementById('labelInput');
  const findInput = document.getElementById('findInput');
  const replaceInput = document.getElementById('replaceInput');
  const isRegexCheckbox = document.getElementById('isRegex');
  const isCaseSensitiveCheckbox = document.getElementById('isCaseSensitive');
  const matchWholeWordCheckbox = document.getElementById('matchWholeWord');
  const filesToIncludeInput = document.getElementById('filesToInclude');
  const filesToExcludeInput = document.getElementById('filesToExclude');

  if (labelInput) labelInput.value = pattern.label || '';
  if (findInput) findInput.value = pattern.find || '';
  if (replaceInput) replaceInput.value = pattern.replace || '';
  if (isRegexCheckbox) isRegexCheckbox.checked = pattern.isRegex || false;
  if (isCaseSensitiveCheckbox) isCaseSensitiveCheckbox.checked = pattern.isCaseSensitive || false;
  if (matchWholeWordCheckbox) matchWholeWordCheckbox.checked = pattern.matchWholeWord || false;
  if (filesToIncludeInput) filesToIncludeInput.value = pattern.filesToInclude || '';
  if (filesToExcludeInput) filesToExcludeInput.value = pattern.filesToExclude || '';
}

// Helper function to clear the edit panel
function clearPatternDetails() {
  const labelInput = document.getElementById('labelInput');
  const findInput = document.getElementById('findInput');
  const replaceInput = document.getElementById('replaceInput');
  const isRegexCheckbox = document.getElementById('isRegex');
  const isCaseSensitiveCheckbox = document.getElementById('isCaseSensitive');
  const matchWholeWordCheckbox = document.getElementById('matchWholeWord');
  const filesToIncludeInput = document.getElementById('filesToInclude');
  const filesToExcludeInput = document.getElementById('filesToExclude');

  if (labelInput) labelInput.value = '';
  if (findInput) findInput.value = '';
  if (replaceInput) replaceInput.value = '';
  if (isRegexCheckbox) isRegexCheckbox.checked = false;
  if (isCaseSensitiveCheckbox) isCaseSensitiveCheckbox.checked = false;
  if (matchWholeWordCheckbox) matchWholeWordCheckbox.checked = false;
  if (filesToIncludeInput) filesToIncludeInput.value = '';
  if (filesToExcludeInput) filesToExcludeInput.value = '';
}

/**
 * Handle pattern item click - populate edit panel with pattern data
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

  // Find the selected pattern in the appropriate array
  const selectedPattern = (scope === 'workspace' ? workspacePatterns : userPatterns)
    .find(pattern => pattern.label === label);

  if (selectedPattern) {
    populatePatternDetails(selectedPattern);
  } else {
    clearPatternDetails();
  }
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
