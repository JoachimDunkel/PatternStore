const vscode = acquireVsCodeApi();

// Store patterns data
let workspacePatterns = [];
let userPatterns = [];
let searchQuery = '';
let currentPattern = null; // Track currently selected pattern for auto-save
let lastSavedData = null; // Track last saved form data to avoid unnecessary saves
let autoSaveTimeout = null; // For debouncing auto-save
let saveStatusTimeout = null; // For hiding save status if it gets stuck

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
    setupAutoSave(); // Setup auto-save for form inputs
    
    // Focus search input when webview opens
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  } else if (message.type === 'saveSuccess') {
    // Clear any existing save status timeout
    if (saveStatusTimeout) {
      clearTimeout(saveStatusTimeout);
      saveStatusTimeout = null;
    }
    showSaveStatus('Saved successfully', 'success');
    // Update last saved data on successful save
    lastSavedData = getFormData();
  } else if (message.type === 'saveError') {
    // Clear any existing save status timeout
    if (saveStatusTimeout) {
      clearTimeout(saveStatusTimeout);
      saveStatusTimeout = null;
    }
    showSaveStatus('Save failed: ' + message.error, 'error');
    // Revert last saved data on error
    lastSavedData = null;
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
  
  // Delete button in edit panel
  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteCurrent);
  }
  
  // Load to Search button in edit panel
  const loadToSearchBtn = document.getElementById('loadToSearchBtn');
  if (loadToSearchBtn) {
    loadToSearchBtn.addEventListener('click', handleLoadToSearch);
  }
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
  
  // Update last saved data to current pattern data (normalized)
  const formData = getFormData();
  lastSavedData = {
    ...formData,
    label: formData.label?.trim(),
    filesToInclude: formData.filesToInclude?.trim(),
    filesToExclude: formData.filesToExclude?.trim()
  };
}/**
 * Setup auto-save event listeners for form inputs
 */
function setupAutoSave() {
  const formInputs = [
    'labelInput',
    'findInput', 
    'replaceInput',
    'isRegex',
    'isCaseSensitive',
    'matchWholeWord',
    'filesToInclude',
    'filesToExclude'
  ];
  
  formInputs.forEach(inputId => {
    const element = document.getElementById(inputId);
    if (element) {
      element.addEventListener('input', handleFormChange);
      element.addEventListener('change', handleFormChange);
    }
  });
}

/**
 * Handle form input changes - trigger auto-save only if data changed
 */
function handleFormChange() {
  if (!currentPattern) return;
  
  const currentData = getFormData();
  
  // Create normalized versions for comparison (trim strings)
  const normalizeData = (data) => ({
    ...data,
    label: data.label?.trim(),
    find: data.find,
    replace: data.replace,
    filesToInclude: data.filesToInclude?.trim(),
    filesToExclude: data.filesToExclude?.trim()
  });
  
  const normalizedCurrent = normalizeData(currentData);
  const normalizedLast = lastSavedData ? normalizeData(lastSavedData) : null;
  
  // Only save if data actually changed
  if (JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedLast)) {
    return; // No changes, don't save
  }
  
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  // Debounce auto-save (save after 1 second of no changes)
  autoSaveTimeout = setTimeout(() => {
    autoSavePattern();
  }, 1000);
}

/**
 * Show save status message
 */
function showSaveStatus(message, type = 'info') {
  const statusEl = document.getElementById('saveStatus');
  if (!statusEl) return;
  
  // Clear any existing timeout
  if (saveStatusTimeout) {
    clearTimeout(saveStatusTimeout);
    saveStatusTimeout = null;
  }
  
  statusEl.textContent = message;
  statusEl.className = `save-status ${type}`;
  statusEl.style.display = 'block';
  
  // For success, hide quickly (VS Code-like timing)
  if (type === 'success') {
    saveStatusTimeout = setTimeout(() => {
      statusEl.style.display = 'none';
    }, 1500); // 1.5 seconds - much shorter than before
  }
  // For error, hide after longer delay so user notices
  else if (type === 'error') {
    saveStatusTimeout = setTimeout(() => {
      statusEl.style.display = 'none';
    }, 4000); // 4 seconds - longer for errors
  }
  // For 'saving', no timeout - wait for success/error message
}

/**
 * Auto-save the current pattern with form data
 */
function autoSavePattern() {
  if (!currentPattern) return;
  
  const formData = getFormData();
  
  // Show saving status
  showSaveStatus('Saving...', 'saving');
  
  // Send save request to extension
  vscode.postMessage({
    type: 'save',
    originalLabel: currentPattern.label,
    originalScope: currentPattern.scope,
    pattern: formData
  });
  
  // Update last saved data immediately (optimistic update)
  lastSavedData = formData;
}

/**
 * Get current form data as pattern object
 */
function getFormData() {
  return {
    label: document.getElementById('labelInput').value.trim(),
    find: document.getElementById('findInput').value,
    replace: document.getElementById('replaceInput').value || undefined,
    flags: {
      isRegex: document.getElementById('isRegex').checked,
      isCaseSensitive: document.getElementById('isCaseSensitive').checked,
      matchWholeWord: document.getElementById('matchWholeWord').checked,
      isMultiline: false // Not implemented in UI yet
    },
    filesToInclude: document.getElementById('filesToInclude').value.trim() || undefined,
    filesToExclude: document.getElementById('filesToExclude').value.trim() || undefined,
    scope: currentPattern.scope // Keep original scope
  };
}/**
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
    currentPattern = selectedPattern; // Track for auto-save
    populatePatternDetails(selectedPattern);
  } else {
    currentPattern = null;
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
 * Handle delete action for currently selected pattern
 */
function handleDeleteCurrent() {
  if (!currentPattern) return;
  
  handleDelete(currentPattern.label, currentPattern.scope);
}

/**
 * Handle load to search for current form data
 */
function handleLoadToSearch() {
  if (!currentPattern) return;
  
  const formData = getFormData();
  
  // Send load request to extension with current form data
  vscode.postMessage({
    type: 'loadFromForm',
    pattern: formData
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
