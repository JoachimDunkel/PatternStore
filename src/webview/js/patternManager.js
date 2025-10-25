const vscode = acquireVsCodeApi();

// Store patterns data
let workspacePatterns = [];
let userPatterns = [];
let workspacePatternsMap = new Map(); // id -> pattern
let userPatternsMap = new Map(); // id -> pattern
let searchQuery = '';

// Dirty state tracking
let savedPatternState = null;

// Cache DOM elements for performance
const domCache = {
  labelInput: null,
  findInput: null,
  replaceInput: null,
  filesToInclude: null,
  filesToExclude: null,
  isRegex: null,
  isCaseSensitive: null,
  matchWholeWord: null,
  isRegexBtn: null,
  isCaseSensitiveBtn: null,
  matchWholeWordBtn: null,
  dirtyIndicator: null,
  patternList: null,
  editForm: null,
  editEmptyState: null,
  findValidationError: null
};

function initDomCache() {
  domCache.labelInput = document.getElementById('labelInput');
  domCache.findInput = document.getElementById('findInput');
  domCache.replaceInput = document.getElementById('replaceInput');
  domCache.filesToInclude = document.getElementById('filesToInclude');
  domCache.filesToExclude = document.getElementById('filesToExclude');
  domCache.isRegex = document.getElementById('isRegex');
  domCache.isCaseSensitive = document.getElementById('isCaseSensitive');
  domCache.matchWholeWord = document.getElementById('matchWholeWord');
  domCache.isRegexBtn = document.getElementById('isRegexBtn');
  domCache.isCaseSensitiveBtn = document.getElementById('isCaseSensitiveBtn');
  domCache.matchWholeWordBtn = document.getElementById('matchWholeWordBtn');
  domCache.dirtyIndicator = document.getElementById('dirtyIndicator');
  domCache.patternList = document.getElementById('patternList');
  domCache.editForm = document.getElementById('editForm');
  domCache.editEmptyState = document.getElementById('editEmptyState');
  domCache.findValidationError = document.getElementById('findValidationError');
}

function checkIfDirty() {
  const state = vscode.getState() || {};
  const currentPattern = state.currentPattern;

  if (!currentPattern || !savedPatternState) {
    updateDirtyIndicator(false);
    clearAllDirtyClasses();
    return;
  }

  // Compare current form values with saved state
  const isDirty =
    domCache.labelInput.value.trim() !== savedPatternState.label ||
    domCache.findInput.value !== savedPatternState.find ||
    domCache.replaceInput.value !== savedPatternState.replace ||
    domCache.isRegex.checked !== savedPatternState.flags.isRegex ||
    domCache.isCaseSensitive.checked !== savedPatternState.flags.isCaseSensitive ||
    domCache.matchWholeWord.checked !== savedPatternState.flags.matchWholeWord ||
    (domCache.filesToInclude.value.trim() || '') !== (savedPatternState.filesToInclude || '') ||
    (domCache.filesToExclude.value.trim() || '') !== (savedPatternState.filesToExclude || '');

  updateDirtyIndicator(isDirty);
  updateFieldDirtyStates();
}

function updateDirtyIndicator(isDirty) {
  if (domCache.dirtyIndicator) {
    domCache.dirtyIndicator.style.visibility = isDirty ? 'visible' : 'hidden';
  }
}

function updateFieldDirtyStates() {
  if (!savedPatternState) {
    clearAllDirtyClasses();
    return;
  }

  // Check text inputs using cached DOM references
  if (domCache.labelInput) {
    toggleDirtyClass(domCache.labelInput, domCache.labelInput.value.trim() !== savedPatternState.label);
  }
  if (domCache.findInput) {
    toggleDirtyClass(domCache.findInput, domCache.findInput.value !== savedPatternState.find);
  }
  if (domCache.replaceInput) {
    toggleDirtyClass(domCache.replaceInput, domCache.replaceInput.value !== savedPatternState.replace);
  }
  if (domCache.filesToInclude) {
    toggleDirtyClass(domCache.filesToInclude, (domCache.filesToInclude.value.trim() || '') !== (savedPatternState.filesToInclude || ''));
  }
  if (domCache.filesToExclude) {
    toggleDirtyClass(domCache.filesToExclude, (domCache.filesToExclude.value.trim() || '') !== (savedPatternState.filesToExclude || ''));
  }

  // Check toggle buttons using cached DOM references
  if (domCache.isRegexBtn && domCache.isRegex) {
    toggleDirtyClass(domCache.isRegexBtn, domCache.isRegex.checked !== savedPatternState.flags.isRegex);
  }
  if (domCache.isCaseSensitiveBtn && domCache.isCaseSensitive) {
    toggleDirtyClass(domCache.isCaseSensitiveBtn, domCache.isCaseSensitive.checked !== savedPatternState.flags.isCaseSensitive);
  }
  if (domCache.matchWholeWordBtn && domCache.matchWholeWord) {
    toggleDirtyClass(domCache.matchWholeWordBtn, domCache.matchWholeWord.checked !== savedPatternState.flags.matchWholeWord);
  }
}

function toggleDirtyClass(element, isDirty) {
  if (isDirty) {
    element.classList.add('dirty');
  } else {
    element.classList.remove('dirty');
  }
}

function clearAllDirtyClasses() {
  const elements = [
    domCache.labelInput, domCache.findInput, domCache.replaceInput,
    domCache.filesToInclude, domCache.filesToExclude,
    domCache.isRegexBtn, domCache.isCaseSensitiveBtn, domCache.matchWholeWordBtn
  ];

  elements.forEach(element => {
    if (element) {
      element.classList.remove('dirty');
    }
  });
}

function saveDirtyState(pattern) {
  savedPatternState = {
    label: pattern.label,
    find: pattern.find || '',
    replace: pattern.replace || '',
    flags: { ...pattern.flags },
    filesToInclude: pattern.filesToInclude || '',
    filesToExclude: pattern.filesToExclude || ''
  };
  updateDirtyIndicator(false);
  clearAllDirtyClasses();
}

function findPatternById(id, scope) {
  const map = scope === 'workspace' ? workspacePatternsMap : userPatternsMap;
  return map.get(id);
}

function rebuildPatternMaps() {
  workspacePatternsMap.clear();
  userPatternsMap.clear();

  workspacePatterns.forEach(p => workspacePatternsMap.set(p.id, p));
  userPatterns.forEach(p => userPatternsMap.set(p.id, p));
}

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

window.addEventListener('message', event => {
  const message = event.data;

  if (message.type === 'patterns') {

    disablePatternList(false);
    document.body.style.cursor = '';

    workspacePatterns = message.workspace;
    userPatterns = message.user;
    rebuildPatternMaps(); // Rebuild Maps for O(1) lookups
    renderPatternList();
    setupSearchInput();

    if (message.selectPattern) {
      selectPattern(message.selectPattern.id, message.selectPattern.scope);
    } else {
      const state = vscode.getState() || {};
      if (state.currentPattern) {
        const allPatterns = state.currentPattern.scope === 'workspace' ? workspacePatterns : userPatterns;
        const stillExists = allPatterns.some(p => p.id === state.currentPattern.id);

        if (!stillExists) {
          clearDetailsView();
        }
      }
    }

    // Focus search input when webview opens
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

function setupSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  if (!searchInput || !searchClear) return;

  // if (searchInput.dataset.initialized === 'true') {
  //   return;
  // }

  // searchInput.dataset.initialized = 'true';

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();

    if (searchQuery) {
      searchClear.classList.add('visible');
    } else {
      searchClear.classList.remove('visible');
    }

    renderPatternList();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.remove('visible');
    renderPatternList();
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchQuery) {
      searchInput.value = '';
      searchQuery = '';
      searchClear.classList.remove('visible');
      renderPatternList();
    }
  });
}

function filterPatterns(patterns) {
  if (!searchQuery) return patterns;

  return patterns.filter(pattern => {
    const nameMatch = pattern.label.toLowerCase().includes(searchQuery);
    const findMatch = pattern.find.toLowerCase().includes(searchQuery);
    const replaceMatch = pattern.replace && pattern.replace.toLowerCase().includes(searchQuery);
    return nameMatch || findMatch || replaceMatch;
  });
}


function renderPatternList() {
  const listContainer = document.getElementById('patternList');

  const filteredWorkspace = filterPatterns(workspacePatterns);
  const filteredUser = filterPatterns(userPatterns);
  let html = '';

  if (searchQuery && filteredWorkspace.length === 0 && filteredUser.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No patterns found</div>';
    return;
  }

  const workspaceCollapsed = searchQuery ? false : getCollapseState('workspace');
  html += renderSection('workspace', 'Workspace', filteredWorkspace, workspaceCollapsed);

  const userCollapsed = searchQuery ? false : getCollapseState('user');
  html += renderSection('user', 'User', filteredUser, userCollapsed);

  listContainer.innerHTML = html;

  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', toggleSection);
  });

  // Event delegation handles all pattern list interactions, no need to re-attach
}


function renderSection(id, title, patterns, collapsed) {
  const chevron = collapsed ? 'codicon-chevron-right' : 'codicon-chevron-down';
  const contentClass = collapsed ? 'section-content collapsed' : 'section-content';

  let html = `
  <div class="section-header ${collapsed ? 'collapsed' : ''}" data-section="${id}">
    <div class="section-header-left">
      <i class="codicon ${chevron}"></i>
      <span>${title} (${patterns.length})</span>
    </div>
    <button class="add-pattern-btn" data-scope="${id}" title="Add new pattern">
      <i class="codicon codicon-add"></i>
    </button>
  </div>
  <div class="${contentClass}" data-section-content="${id}">
	`;

  if (patterns.length === 0) {
    html += '<div class="empty-state-section">No patterns in this scope</div>';
  } else {
    patterns.forEach(pattern => {
      html += renderPatternItem(pattern);
    });
  }

  html += '</div>';
  return html;
}


function toggleSection(event) {
  if (event.target.closest('.add-pattern-btn')) {
    return;
  }

  const header = event.currentTarget;
  const sectionId = header.dataset.section;
  const content = document.querySelector('[data-section-content="' + sectionId + '"]');
  const chevron = header.querySelector('.codicon');

  const isCollapsed = header.classList.contains('collapsed');

  if (isCollapsed) {
    header.classList.remove('collapsed');
    content.classList.remove('collapsed');
    chevron.classList.remove('codicon-chevron-right');
    chevron.classList.add('codicon-chevron-down');
    setCollapseState(sectionId, false);
  } else {
    header.classList.add('collapsed');
    content.classList.add('collapsed');
    chevron.classList.remove('codicon-chevron-down');
    chevron.classList.add('codicon-chevron-right');
    setCollapseState(sectionId, true);
  }
}

function renderPatternItem(pattern) {
  const preview = pattern.find.substring(0, 40);
  const truncated = pattern.find.length > 40 ? '...' : '';
  const isInvalid = !pattern.find || pattern.find.trim() === '';
  const invalidClass = isInvalid ? 'pattern-item-invalid' : '';

  return `
    <div class="pattern-item ${invalidClass}" data-id="${pattern.id}" data-label="${pattern.label}" data-scope="${pattern.scope}">      <div class="pattern-info">
        <div class="pattern-name">
          ${pattern.label}
          ${isInvalid ? '<i class="codicon codicon-warning" title="Find field is empty"></i>' : ''}
        </div>
        <div class="pattern-preview">${isInvalid ? '<em>Empty find pattern</em>' : preview + truncated}</div>
      </div>
      <div class="pattern-actions">
        ${renderActionButton('trash', 'delete', 'Delete pattern')}
        ${renderActionButton('arrow-right', 'load', 'Load to search')}
      </div>
    </div>
  `;
}

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

// Event delegation for pattern list - set up once, works for all items
function setupEventDelegation() {
  if (!domCache.patternList) return;

  // Delegate all pattern list events to the parent container
  domCache.patternList.addEventListener('click', (event) => {
    // Handle pattern item click
    const patternItem = event.target.closest('.pattern-item');
    if (patternItem && !event.target.closest('.action-btn') && !event.target.closest('.add-pattern-btn')) {
      handlePatternClick(patternItem);
      return;
    }

    // Handle action button clicks (load, delete)
    const actionBtn = event.target.closest('.action-btn');
    if (actionBtn) {
      event.stopPropagation();
      handleActionClick(actionBtn);
      return;
    }

    // Handle add pattern button clicks
    const addBtn = event.target.closest('.add-pattern-btn');
    if (addBtn) {
      event.stopPropagation();
      handleAddPattern(addBtn);
      return;
    }
  });
}

function handlePatternClick(item) {
  const id = item.dataset.id;
  const scope = item.dataset.scope;

  document.querySelectorAll('.pattern-item').forEach(i => {
    i.classList.remove('selected');
  });

  item.classList.add('selected');

  const pattern = findPatternById(id, scope);

  if (pattern) {
    populateDetailsView(pattern);
  }
}

function populateDetailsView(pattern) {
  domCache.editEmptyState.style.display = 'none';
  domCache.editForm.classList.add('active');

  domCache.labelInput.value = pattern.label;
  domCache.findInput.value = pattern.find || '';
  domCache.replaceInput.value = pattern.replace || '';

  domCache.isRegex.checked = pattern.flags.isRegex;
  domCache.isCaseSensitive.checked = pattern.flags.isCaseSensitive;
  domCache.matchWholeWord.checked = pattern.flags.matchWholeWord;

  updateToggleButtonState(domCache.isRegexBtn, pattern.flags.isRegex);
  updateToggleButtonState(domCache.isCaseSensitiveBtn, pattern.flags.isCaseSensitive);
  updateToggleButtonState(domCache.matchWholeWordBtn, pattern.flags.matchWholeWord);

  domCache.findInput.classList.remove('error');
  domCache.findValidationError.classList.remove('visible');
  validateRegexPattern();

  domCache.filesToInclude.value = pattern.filesToInclude || '';
  domCache.filesToExclude.value = pattern.filesToExclude || '';

  const state = vscode.getState() || {};
  state.currentPattern = {
    id: pattern.id,
    label: pattern.label,
    scope: pattern.scope
  };
  vscode.setState(state);

  // Save the clean state for dirty tracking
  saveDirtyState(pattern);
}

function selectPattern(id, scope) {
  const item = document.querySelector(
    `.pattern-item[data-id="${id}"][data-scope="${scope}"]`
  );

  if (item) {
    item.click();
  }
}

function handleSavePattern() {
  const state = vscode.getState() || {};
  const currentPattern = state.currentPattern;

  if (!currentPattern) {
    console.error('No pattern selected to save');
    return;
  }

  const label = domCache.labelInput.value.trim();
  const find = domCache.findInput.value;
  const replace = domCache.replaceInput.value;

  if (!label) {
    alert('Pattern name cannot be empty');
    return;
  }

  disablePatternList(true);
  document.body.style.cursor = 'wait';

  const pattern = {
    id: currentPattern.id,
    label: label,
    find: find,
    replace: replace,
    flags: {
      isRegex: domCache.isRegex.checked,
      isCaseSensitive: domCache.isCaseSensitive.checked,
      matchWholeWord: domCache.matchWholeWord.checked,
      isMultiline: false
    },
    filesToInclude: domCache.filesToInclude.value.trim() || undefined,
    filesToExclude: domCache.filesToExclude.value.trim() || undefined,
    scope: currentPattern.scope
  };

  vscode.postMessage({
    type: 'save',
    pattern: pattern
  });
}

function disablePatternList(disabled) {
  const listPanel = document.querySelector('.pattern-list-panel');
  if (disabled) {
    listPanel.style.pointerEvents = 'none';
    listPanel.style.opacity = '0.6';
  } else {
    listPanel.style.pointerEvents = '';
    listPanel.style.opacity = '';
  }
}

function handleDeletePattern() {
  const state = vscode.getState() || {};
  const currentPattern = state.currentPattern;

  if (!currentPattern) {
    console.error('No pattern selected to delete');
    return;
  }

  vscode.postMessage({
    type: 'delete',
    id: currentPattern.id,
    scope: currentPattern.scope
  });

}

function handleLoadPatternFromDetails() {
  const state = vscode.getState() || {};
  const currentPattern = state.currentPattern;

  if (!currentPattern) {
    console.error('No pattern selected to load');
    return;
  }

  // Build pattern from current form values (may be dirty)
  const pattern = {
    id: currentPattern.id,
    label: domCache.labelInput.value.trim(),
    find: domCache.findInput.value,
    replace: domCache.replaceInput.value,
    flags: {
      isRegex: domCache.isRegex.checked,
      isCaseSensitive: domCache.isCaseSensitive.checked,
      matchWholeWord: domCache.matchWholeWord.checked,
      isMultiline: false
    },
    filesToInclude: domCache.filesToInclude.value.trim() || undefined,
    filesToExclude: domCache.filesToExclude.value.trim() || undefined,
    scope: currentPattern.scope
  };

  vscode.postMessage({
    type: 'load',
    id: currentPattern.id,
    scope: currentPattern.scope,
    pattern: pattern
  });
}

function clearDetailsView() {
  domCache.editForm.classList.remove('active');
  domCache.editEmptyState.style.display = 'flex';

  domCache.labelInput.value = '';
  domCache.findInput.value = '';
  domCache.replaceInput.value = '';
  domCache.isRegex.checked = false;
  domCache.isCaseSensitive.checked = false;
  domCache.matchWholeWord.checked = false;
  domCache.filesToInclude.value = '';
  domCache.filesToExclude.value = '';

  const state = vscode.getState() || {};
  delete state.currentPattern;
  vscode.setState(state);

  document.querySelectorAll('.pattern-item').forEach(i => {
    i.classList.remove('selected');
  });

  // Clear dirty state
  savedPatternState = null;
  updateDirtyIndicator(false);
  clearAllDirtyClasses();
}

/**
 * Setup toggle buttons for flags
 */
function setupToggleButtons() {
  const buttons = [
    { btnId: 'isRegexBtn', checkboxId: 'isRegex' },
    { btnId: 'isCaseSensitiveBtn', checkboxId: 'isCaseSensitive' },
    { btnId: 'matchWholeWordBtn', checkboxId: 'matchWholeWord' }
  ];

  buttons.forEach(({ btnId, checkboxId }) => {
    const btn = document.getElementById(btnId);
    const checkbox = document.getElementById(checkboxId);

    if (!btn || !checkbox) return;

    btn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      updateToggleButtonState(btn, checkbox.checked);

      // Validate regex when regex flag changes
      if (checkboxId === 'isRegex') {
        validateRegexPattern();
      }

      // Check if field is dirty
      checkIfDirty();
    });

    // Initialize button state
    updateToggleButtonState(btn, checkbox.checked);
  });
}

/**
 * Update visual state of toggle button
 */
function updateToggleButtonState(button, isActive) {
  if (isActive) {
    button.classList.add('active');
  } else {
    button.classList.remove('active');
  }
}

/**
 * Validate regex pattern
 */
function validateRegexPattern() {
  const isRegex = domCache.isRegex.checked;

  if (!isRegex) {
    // Not using regex, clear any errors
    domCache.findInput.classList.remove('error');
    domCache.findValidationError.classList.remove('visible');
    domCache.findValidationError.textContent = '';
    return true;
  }

  const pattern = domCache.findInput.value;

  if (!pattern) {
    // Empty pattern is okay
    domCache.findInput.classList.remove('error');
    domCache.findValidationError.classList.remove('visible');
    domCache.findValidationError.textContent = '';
    return true;
  }

  try {
    new RegExp(pattern);
    // Valid regex
    domCache.findInput.classList.remove('error');
    domCache.findValidationError.classList.remove('visible');
    domCache.findValidationError.textContent = '';
    return true;
  } catch (e) {
    // Invalid regex
    domCache.findInput.classList.add('error');
    domCache.findValidationError.classList.add('visible');
    domCache.findValidationError.textContent = `Invalid regular expression: ${e.message}`;
    return false;
  }
}

function handleAddPattern(button) {
  const scope = button.dataset.scope;

  // Visual feedback: disable button temporarily
  button.disabled = true;
  button.style.opacity = '0.5';
  button.style.cursor = 'wait';

  vscode.postMessage({
    type: 'create',
    scope: scope === 'workspace' ? 'workspace' : 'global'
  });

  // Re-enable after 2 seconds (fallback in case of error)
  setTimeout(() => {
    button.disabled = false;
    button.style.opacity = '';
    button.style.cursor = '';
  }, 2000);
}

function handleActionClick(button) {
  const action = button.dataset.action;
  const item = button.closest('.pattern-item');
  const id = item.dataset.id;
  const scope = item.dataset.scope;

  if (action === 'delete') {
    handleDelete(id, scope);
  } else if (action === 'load') {
    handleLoad(id, scope);
  }
}

function handleDelete(id, scope) {
  vscode.postMessage({
    type: 'delete',
    id: id,
    scope: scope
  });
}

function handleLoad(id, scope) {
  if (!id || !scope) {
    console.error('Pattern not found');
    return;
  }

  vscode.postMessage({
    type: 'load',
    id: id,
    scope: scope
  });
}

document.getElementById('saveBtn').addEventListener('click', handleSavePattern);
document.getElementById('loadBtn').addEventListener('click', handleLoadPatternFromDetails);

setupToggleButtons();

// Add event listeners to all form inputs for dirty tracking
const formInputs = [
  'labelInput', 'findInput', 'replaceInput',
  'isRegex', 'isCaseSensitive', 'matchWholeWord',
  'filesToInclude', 'filesToExclude'
];

formInputs.forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('input', checkIfDirty);
    element.addEventListener('change', checkIfDirty);
  }
});

// Initialize DOM cache for performance
initDomCache();

// Set up event delegation for pattern list (once, not per render)
setupEventDelegation();

// Resizable panels functionality
function setupResizablePanels() {
  const resizeHandle = document.getElementById('resizeHandle');
  const patternListPanel = document.querySelector('.pattern-list-panel');

  if (!resizeHandle || !patternListPanel) return;

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  // Load saved width from state
  const state = vscode.getState() || {};
  if (state.panelWidth) {
    patternListPanel.style.flexBasis = `${state.panelWidth}px`;
  }

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = patternListPanel.offsetWidth;
    resizeHandle.classList.add('resizing');
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;

    // Respect min/max constraints
    const minWidth = 200;
    const maxWidth = 600;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

    patternListPanel.style.flexBasis = `${clampedWidth}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save width to state
      const currentWidth = patternListPanel.offsetWidth;
      const state = vscode.getState() || {};
      state.panelWidth = currentWidth;
      vscode.setState(state);
    }
  });
}

// Set up resizable panels
setupResizablePanels();

// Add validation listener to find input
if (domCache.findInput) {
  domCache.findInput.addEventListener('input', () => {
    validateRegexPattern();
  });
}

vscode.postMessage({ type: 'ready' });
