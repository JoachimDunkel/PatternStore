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
}

function handlePatternClick(event) {
	const item = event.currentTarget;
	const label = item.dataset.label;
	const scope = item.dataset.scope;

	document.querySelectorAll('.pattern-item').forEach(i => {
		i.classList.remove('selected');
	});

	item.classList.add('selected');

	// TODO: Load pattern details into right panel
	console.log('Selected pattern:', label, scope);
}

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

function handleDelete(label, scope) {
	vscode.postMessage({
		type: 'delete',
		label: label,
		scope: scope
	});
}


function handleLoad(label, scope) {
	vscode.postMessage({
		type: 'load',
		label: label,
		scope: scope
	});
}

vscode.postMessage({ type: 'ready' });
