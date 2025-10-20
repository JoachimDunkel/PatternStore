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

window.addEventListener('message', event => {
  const message = event.data;

  if (message.type === 'patterns') {
    workspacePatterns = message.workspace;
    userPatterns = message.user;
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

  attachEventListeners();
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

function attachEventListeners() {
  document.querySelectorAll('.pattern-item').forEach(item => {
    item.addEventListener('click', handlePatternClick);
  });

  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', handleActionClick);
  });

  document.querySelectorAll('.add-pattern-btn').forEach(btn => {
    btn.addEventListener('click', handleAddPattern);
  });
}

function handlePatternClick(event) {
  const item = event.currentTarget;
  const id = item.dataset.id;
  const scope = item.dataset.scope;

  document.querySelectorAll('.pattern-item').forEach(i => {
    i.classList.remove('selected');
  });

  item.classList.add('selected');

  const allPatterns = scope === 'workspace' ? workspacePatterns : userPatterns;
  const pattern = allPatterns.find(p => p.id === id);

  if (pattern) {
    populateDetailsView(pattern);
  }
}

function populateDetailsView(pattern) {
  document.getElementById('editEmptyState').style.display = 'none';
  document.getElementById('editForm').classList.add('active');

  document.getElementById('labelInput').value = pattern.label;
  document.getElementById('findInput').value = pattern.find || '';
  document.getElementById('replaceInput').value = pattern.replace || '';

  document.getElementById('isRegex').checked = pattern.flags.isRegex;
  document.getElementById('isCaseSensitive').checked = pattern.flags.isCaseSensitive;
  document.getElementById('matchWholeWord').checked = pattern.flags.matchWholeWord;

  updateToggleButtonState(document.getElementById('isRegexBtn'), pattern.flags.isRegex);
  updateToggleButtonState(document.getElementById('isCaseSensitiveBtn'), pattern.flags.isCaseSensitive);
  updateToggleButtonState(document.getElementById('matchWholeWordBtn'), pattern.flags.matchWholeWord);

  document.getElementById('findInput').classList.remove('error');
  document.getElementById('findValidationError').classList.remove('visible');

  document.getElementById('filesToInclude').value = pattern.filesToInclude || '';
  document.getElementById('filesToExclude').value = pattern.filesToExclude || '';

  const state = vscode.getState() || {};
  state.currentPattern = {
    id: pattern.id,
    label: pattern.label,
    scope: pattern.scope
  };
  vscode.setState(state);
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

  // Get form values
  const label = document.getElementById('labelInput').value.trim();
  const find = document.getElementById('findInput').value;
  const replace = document.getElementById('replaceInput').value;

  // Validate
  if (!label) {
    alert('Pattern name cannot be empty');
    return;
  }

  if (!validateRegexPattern()) {
    alert('Please fix the regex pattern error before saving');
    return;
  }

  const pattern = {
    id: currentPattern.id,
    label: label,
    find: find,
    replace: replace,
    flags: {
      isRegex: document.getElementById('isRegex').checked,
      isCaseSensitive: document.getElementById('isCaseSensitive').checked,
      matchWholeWord: document.getElementById('matchWholeWord').checked,
      isMultiline: false
    },
    filesToInclude: document.getElementById('filesToInclude').value.trim() || undefined,
    filesToExclude: document.getElementById('filesToExclude').value.trim() || undefined,
    scope: currentPattern.scope
  };

  // Send save request to extension
  vscode.postMessage({
    type: 'save',
    pattern: pattern
  });
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

  vscode.postMessage({
    type: 'load',
    id: currentPattern.id,
    scope: currentPattern.scope
  });
}

function clearDetailsView() {
  document.getElementById('editForm').classList.remove('active');
  document.getElementById('editEmptyState').style.display = 'flex';

  document.getElementById('labelInput').value = '';
  document.getElementById('findInput').value = '';
  document.getElementById('replaceInput').value = '';
  document.getElementById('isRegex').checked = false;
  document.getElementById('isCaseSensitive').checked = false;
  document.getElementById('matchWholeWord').checked = false;
  document.getElementById('filesToInclude').value = '';
  document.getElementById('filesToExclude').value = '';

  const state = vscode.getState() || {};
  delete state.currentPattern;
  vscode.setState(state);

  document.querySelectorAll('.pattern-item').forEach(i => {
    i.classList.remove('selected');
  });
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
  const findInput = document.getElementById('findInput');
  const isRegex = document.getElementById('isRegex').checked;
  const errorDiv = document.getElementById('findValidationError');

  if (!isRegex) {
    // Not using regex, clear any errors
    findInput.classList.remove('error');
    errorDiv.classList.remove('visible');
    errorDiv.textContent = '';
    return true;
  }

  const pattern = findInput.value;

  if (!pattern) {
    // Empty pattern is okay
    findInput.classList.remove('error');
    errorDiv.classList.remove('visible');
    errorDiv.textContent = '';
    return true;
  }

  try {
    new RegExp(pattern);
    // Valid regex
    findInput.classList.remove('error');
    errorDiv.classList.remove('visible');
    errorDiv.textContent = '';
    return true;
  } catch (e) {
    // Invalid regex
    findInput.classList.add('error');
    errorDiv.classList.add('visible');
    errorDiv.textContent = `Invalid regular expression: ${e.message}`;
    return false;
  }
}

function handleAddPattern(event) {
  event.stopPropagation();

  const button = event.currentTarget;
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

function handleActionClick(event) {
  event.stopPropagation();

  const button = event.currentTarget;
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
  vscode.postMessage({
    type: 'load',
    id: id,
    scope: scope
  });
}

document.getElementById('saveBtn').addEventListener('click', handleSavePattern);
document.getElementById('deleteBtn').addEventListener('click', handleDeletePattern);
document.getElementById('loadBtn').addEventListener('click', handleLoadPatternFromDetails);

setupToggleButtons();

const findInput = document.getElementById('findInput');
if (findInput) {
  findInput.addEventListener('input', () => {
    validateRegexPattern();
  });
}

vscode.postMessage({ type: 'ready' });
