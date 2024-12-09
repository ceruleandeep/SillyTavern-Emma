// noinspection DuplicatedCode

// Utility functions for handling global extensions
async function showExtensionPath(extensionBlock) {
    const extensionName = extensionBlock.getAttribute('data-name');
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const basePath = settings.basePath.trim();
    const fullPath = basePath ? `${basePath}${extensionName}` : `extensions/third-party${extensionName}`;
    const ideCommand = settings.ideCommand?.replace('{path}', fullPath) || '';

    // Try to use the API endpoint first
    try {
        const response = await fetch('/api/plugins/emm/open', {
            method: 'POST',
            headers: context.getRequestHeaders(),
            body: JSON.stringify({
                editor: settings.editor || 'code',
                extensionName: extensionName.replace(/^\//, ''), // Remove leading slash
            }),
        });

        if (response.ok) {
            // API call successful, no need to show popup
            return;
        }

        // Try to get error details from response
        try {
            const errorData = await response.json();
            if (errorData.error && errorData.details) {
                toastr.error(`${errorData.error}: ${errorData.details}`);
            }
        } catch (parseError) {
            console.debug('Extension Manager: Failed to parse error response', parseError);
        }

        // Fall through to showing the popup
    } catch (error) {
        console.debug('Extension Manager: API not available, falling back to popup', error);
        // Fall through to showing the popup
    }

    // Original popup behavior as fallback
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Edit Extension';
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';

    // Path row
    const pathRow = document.createElement('div');
    pathRow.style.display = 'flex';
    pathRow.style.alignItems = 'center';
    pathRow.style.gap = '10px';

    const pathText = document.createElement('div');
    pathText.textContent = fullPath;
    pathText.classList.add('monospace');

    const copyPath = document.createElement('div');
    copyPath.classList.add('menu_button', 'fa-fw', 'fa-solid', 'fa-copy');
    copyPath.title = 'Copy path to clipboard';
    copyPath.addEventListener('click', async () => {
        await navigator.clipboard.writeText(fullPath);
        copyPath.classList.add('emm--success');
        setTimeout(() => copyPath.classList.remove('emm--success'), 3000);
    });

    pathRow.append(pathText, copyPath);

    // Command row
    const commandRow = document.createElement('div');
    commandRow.style.display = 'flex';
    commandRow.style.alignItems = 'center';
    commandRow.style.gap = '10px';

    const commandText = document.createElement('div');
    commandText.textContent = ideCommand;
    commandText.classList.add('monospace');

    const copyCommand = document.createElement('div');
    copyCommand.classList.add('menu_button', 'fa-fw', 'fa-solid', 'fa-copy');
    copyCommand.title = 'Copy command to clipboard';
    copyCommand.addEventListener('click', async () => {
        await navigator.clipboard.writeText(ideCommand);
        copyCommand.classList.add('emm--success');
        setTimeout(() => copyCommand.classList.remove('emm--success'), 3000);
    });

    commandRow.append(commandText, copyCommand);

    container.append(title, pathRow, commandRow);
    const popupPromise = context.callGenericPopup(container, context.POPUP_TYPE.TEXT);
    await popupPromise;
}

function addPathButtonsToGlobalExtensions() {
    // Find all extension blocks that have the global icon
    const globalExtensions = document.querySelectorAll('.extension_block .fa-server');

    globalExtensions.forEach(icon => {
        const extensionBlock = icon.closest('.extension_block');
        const actionsDiv = extensionBlock.querySelector('.extension_actions');

        // Check if we already added our button
        if (actionsDiv && !actionsDiv.querySelector('.btn_path')) {
            const pathButton = document.createElement('button');
            pathButton.className = 'btn_path menu_button interactable';
            pathButton.title = 'Show extension path';
            pathButton.innerHTML = '<i class="fa-solid fa-folder-open fa-fw"></i>';
            pathButton.addEventListener('click', () => showExtensionPath(extensionBlock));

            // Insert before the existing buttons
            actionsDiv.insertBefore(pathButton, actionsDiv.firstChild);
        }
    });
}

// Set up observer to watch for extensions dialog
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            const extensionsInfo = document.querySelector('.extensions_info');
            if (extensionsInfo) {
                addPathButtonsToGlobalExtensions();
            }
        }
    }
});

// Start observing when extension initializes
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

import { settingsKey, EXTENSION_NAME } from './consts.js';

async function createNewExtension(extensionName) {
    const context = SillyTavern.getContext();

    try {
        const response = await fetch('/api/plugins/emm/create', {
            method: 'POST',
            headers: context.getRequestHeaders(),
            body: JSON.stringify({ name: extensionName }),
        });

        if (!response.ok) {
            // Try to get error details from response
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    toastr.error(errorData.error);
                    return;
                }
            } catch (parseError) {
                console.debug('Extension Manager: Failed to parse error response', parseError);
            }
            toastr.error('Failed to create extension');
            return;
        }

        toastr.success('Extension created successfully');
        // Trigger extension list refresh
        document.querySelector('#extension_settings').click();
    } catch (error) {
        console.error('Extension Manager: Failed to create extension', error);
        toastr.error('Failed to create extension');
    }
}

function showCreateExtensionDialog() {
    const context = SillyTavern.getContext();

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    const title = document.createElement('h3');
    title.textContent = 'Create New Extension';
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';

    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('text_pole');
    input.placeholder = 'my-new-extension';

    const button = document.createElement('button');
    button.classList.add('menu_button');
    button.textContent = 'Create';
    button.addEventListener('click', () => {
        const name = input.value.trim();
        if (!name) {
            toastr.warning('Please enter an extension name');
            return;
        }
        createNewExtension(name);
        context.closeGenericPopup();
    });

    container.append(title, input, button);
    context.callGenericPopup(container, context.POPUP_TYPE.TEXT);
}

/**
 * @type {EMMSettings}
 * @typedef {Object} EMMSettings
 * @property {boolean} enabled Whether the extension is enabled
 * @property {string} basePath The base path for third-party extensions
 * @property {string} editor The default editor to open extensions with
 */
const defaultSettings = Object.freeze({
    enabled: true,
    basePath: '',
    editor: 'code', // Default to VS Code
});

async function renderExtensionSettings() {
    const context = SillyTavern.getContext();
    const settingsElementId = `${settingsKey}-settings`;
    const settingsContainer = document.getElementById(settingsElementId) ?? document.getElementById('extensions_settings2');
    if (!settingsContainer) {
        return;
    }

    // Add New Extension button at the top
    const newButton = document.createElement('button');
    newButton.className = 'menu_button btn_new_extension';
    newButton.style.marginBottom = '10px';
    newButton.innerHTML = '<i class="fa-solid fa-plus fa-fw"></i> New Extension';
    newButton.addEventListener('click', showCreateExtensionDialog);
    settingsContainer.appendChild(newButton);

    const inlineDrawer = document.createElement('div');
    inlineDrawer.classList.add('inline-drawer');
    settingsContainer.append(inlineDrawer);

    const inlineDrawerToggle = document.createElement('div');
    inlineDrawerToggle.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const extensionName = document.createElement('b');
    extensionName.textContent = context.t`${EXTENSION_NAME}`;

    const inlineDrawerIcon = document.createElement('div');
    inlineDrawerIcon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    inlineDrawerToggle.append(extensionName, inlineDrawerIcon);

    const inlineDrawerContent = document.createElement('div');
    inlineDrawerContent.classList.add('inline-drawer-content');

    inlineDrawer.append(inlineDrawerToggle, inlineDrawerContent);

    /** @type {EMMSettings} */
    const settings = context.extensionSettings[settingsKey];

    // Enabled
    const enabledCheckboxLabel = document.createElement('label');
    enabledCheckboxLabel.classList.add('checkbox_label');
    enabledCheckboxLabel.htmlFor = `${settingsKey}-enabled`;
    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.id = `${settingsKey}-enabled`;
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = settings.enabled;
    enabledCheckbox.addEventListener('change', () => {
        settings.enabled = enabledCheckbox.checked;
        context.saveSettingsDebounced();
        // renderElement(true);
    });

    const enabledCheckboxText = document.createElement('span');
    enabledCheckboxText.textContent = context.t`Enabled`;
    enabledCheckboxLabel.append(enabledCheckbox, enabledCheckboxText);
    inlineDrawerContent.append(enabledCheckboxLabel);

    // Base path input
    const basePathLabel = document.createElement('label');
    basePathLabel.htmlFor = `${settingsKey}-basePath`;
    basePathLabel.textContent = context.t`Extensions Base Path`;

    const basePathInput = document.createElement('input');
    basePathInput.type = 'text';
    basePathInput.id = `${settingsKey}-basePath`;
    basePathInput.classList.add('text_pole');
    basePathInput.value = settings.basePath || '';
    basePathInput.placeholder = '/path/to/SillyTavern/extensions/third-party';
    basePathInput.addEventListener('input', () => {
        settings.basePath = basePathInput.value;
        context.saveSettingsDebounced();
    });

    inlineDrawerContent.append(basePathLabel, basePathInput);

    // Editor select
    const editorLabel = document.createElement('label');
    editorLabel.htmlFor = `${settingsKey}-editor`;
    editorLabel.textContent = context.t`Editor`;

    const editorSelect = document.createElement('select');
    editorSelect.id = `${settingsKey}-editor`;
    editorSelect.classList.add('text_pole');

    // Populate editors dropdown
    try {
        const response = await fetch('/api/plugins/emm/editors');
        if (response.ok) {
            const editors = await response.json();
            editors.forEach(editor => {
                const option = document.createElement('option');
                option.value = editor;
                option.textContent = editor;
                option.selected = settings.editor === editor;
                editorSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.debug('Extension Manager: Failed to fetch editors', error);
        // Add fallback option
        const option = document.createElement('option');
        option.value = 'code';
        option.textContent = 'code';
        option.selected = true;
        editorSelect.appendChild(option);
    }

    editorSelect.addEventListener('change', () => {
        settings.editor = editorSelect.value;
        context.saveSettingsDebounced();
    });

    inlineDrawerContent.append(editorLabel, editorSelect);
}

(function initExtension() {
    const context = SillyTavern.getContext();

    if (!context.extensionSettings[settingsKey]) {
        context.extensionSettings[settingsKey] = structuredClone(defaultSettings);
    }

    for (const key of Object.keys(defaultSettings)) {
        if (context.extensionSettings[settingsKey][key] === undefined) {
            context.extensionSettings[settingsKey][key] = defaultSettings[key];
        }
    }

    context.saveSettingsDebounced();

    renderExtensionSettings().catch(error => {
        console.error('Extension Manager: Failed to render settings', error);
    });
})();
