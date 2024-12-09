// noinspection DuplicatedCode

import { settingsKey, EXTENSION_NAME } from './consts.js';

let apiAvailable = false;

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
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

async function checkAPIAvailable() {
    try {
        const context = SillyTavern.getContext();
        const response = await fetch('/api/plugins/emm/probe', {
            method: 'GET',
            headers: context.getRequestHeaders(),
        });
        return response.status === 204;
    } catch (error) {
        console.debug('Extension Manager: API probe failed', error);
        return false;
    }
}

async function openExtensionWithAPI(extensionName, editor) {
    const context = SillyTavern.getContext();

    const response = await fetch('/api/plugins/emm/open', {
        method: 'POST',
        headers: context.getRequestHeaders(),
        body: JSON.stringify({
            editor: editor || 'code',
            extensionName: extensionName.replace(/^\//, ''), // Remove leading slash
        }),
    });

    if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json();
        if (errorData.error && errorData.details) {
            toastr.error(`${errorData.error}: ${errorData.details}`);
        }
        throw new Error('API call failed');
    }
}

async function showExtensionPathPopup(fullPath, ideCommand) {
    const context = SillyTavern.getContext();
    const container = document.createElement('div');
    container.classList.add('emm--container');

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Edit Extension';
    title.classList.add('emm--title');

    // Path row
    const pathRow = document.createElement('div');
    pathRow.classList.add('emm--row');

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
    commandRow.classList.add('emm--row');

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
    return context.callGenericPopup(container, context.POPUP_TYPE.TEXT);
}

async function handleOpenExtension(extensionBlock) {
    const extensionName = extensionBlock.getAttribute('data-name');
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const basePath = settings.basePath.trim();
    const fullPath = basePath ? `${basePath}${extensionName}` : `extensions/third-party${extensionName}`;
    const ideCommand = settings.ideCommand?.replace('{path}', fullPath) || '';

    // Try to use the API endpoint first
    try {
        await openExtensionWithAPI(extensionName, settings.editor);
    } catch (error) {
        console.debug('Extension Manager: API not available, falling back to popup', error);
        // Fall through to showing the popup
        await showExtensionPathPopup(fullPath, ideCommand);
    }
}

async function createNewExtension(name, displayName, author) {
    const context = SillyTavern.getContext();

    try {
        const response = await fetch('/api/plugins/emm/create', {
            method: 'POST',
            headers: context.getRequestHeaders(),
            body: JSON.stringify({
                name,
                display_name: displayName,
                author,
            }),
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
        document.querySelector('#extension_settings')?.click();
    } catch (error) {
        console.error('Extension Manager: Failed to create extension', error);
        toastr.error('Failed to create extension');
    }
}

function addPathButtonsToGlobalExtensions() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    // Only proceed if extension is enabled
    if (!settings.enabled) {
        return;
    }

    // Find all extension blocks that have the global icon
    const globalExtensions = document.querySelectorAll('.extension_block .fa-server');

    globalExtensions.forEach(icon => {
        const extensionBlock = icon.closest('.extension_block');
        const actionsDiv = extensionBlock.querySelector('.extension_actions');

        // Check if we already added our button
        if (actionsDiv && !actionsDiv.querySelector('.btn_path')) {
            const pathButton = document.createElement('button');
            pathButton.className = 'btn_path menu_button interactable';
            pathButton.title = 'Open extension';
            pathButton.innerHTML = '<i class="fa-solid fa-folder-open fa-fw"></i>';
            pathButton.addEventListener('click', () => handleOpenExtension(extensionBlock));

            // Insert before the existing buttons
            actionsDiv.insertBefore(pathButton, actionsDiv.firstChild);
        }
    });
}

function updateNewExtensionButton() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    const extensionsBlock = document.querySelector('#rm_extensions_block .extensions_block div');
    const existingButton = document.querySelector('#emm_new_extension_button');

    // Remove existing button if present
    if (existingButton) {
        existingButton.remove();
    }

    // Add button only if extension is enabled and API is available
    if (settings.enabled && apiAvailable && extensionsBlock) {
        const newButton = document.createElement('div');
        newButton.id = 'emm_new_extension_button';
        newButton.className = 'menu_button menu_button_icon';
        newButton.innerHTML = '<i class="fa-solid fa-cube fa-fw"></i><span>New extension</span>';
        newButton.addEventListener('click', showCreateExtensionDialog);
        extensionsBlock.appendChild(newButton);
    }
}

async function showCreateExtensionDialog() {
    const context = SillyTavern.getContext();

    const container = document.createElement('div');
    container.classList.add('emm--container');

    const title = document.createElement('h3');
    title.textContent = 'Create New Extension';
    title.classList.add('emm--title');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.classList.add('text_pole');
    nameInput.placeholder = 'SillyTavern-MyExtension';

    const displayNameInput = document.createElement('input');
    displayNameInput.type = 'text';
    displayNameInput.classList.add('text_pole');
    displayNameInput.placeholder = 'My Extension';

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.classList.add('text_pole');
    authorInput.placeholder = 'Your Name';

    // Labels
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Extension ID';
    const displayNameLabel = document.createElement('label');
    displayNameLabel.textContent = 'Display Name';
    const authorLabel = document.createElement('label');
    authorLabel.textContent = 'Author';

    container.append(
        title,
        nameLabel, nameInput,
        displayNameLabel, displayNameInput,
        authorLabel, authorInput,
    );

    const confirmation = await context.callGenericPopup(container, context.POPUP_TYPE.CONFIRM, '', {
        okButton: 'Create Extension',
        cancelButton: 'Cancel',
    });

    if (confirmation !== context.POPUP_RESULT.AFFIRMATIVE) {
        return;
    }

    const name = nameInput.value.trim();
    const displayName = displayNameInput.value.trim();
    const author = authorInput.value.trim();

    if (!name) {
        toastr.warning('Please enter an extension ID');
        return;
    }
    if (!displayName) {
        toastr.warning('Please enter a display name');
        return;
    }
    if (!author) {
        toastr.warning('Please enter an author name');
        return;
    }
    await createNewExtension(name, displayName, author);
}

async function renderExtensionSettings() {
    const context = SillyTavern.getContext();
    const settingsElementId = `${settingsKey}-settings`;
    const settingsContainer = document.getElementById(settingsElementId) ?? document.getElementById('extensions_settings2');
    if (!settingsContainer) {
        return;
    }

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
        updateNewExtensionButton();

        // Remove path buttons if disabled
        if (!settings.enabled) {
            document.querySelectorAll('.btn_path').forEach(button => button.remove());
        } else {
            addPathButtonsToGlobalExtensions();
        }
    });

    const enabledCheckboxText = document.createElement('span');
    enabledCheckboxText.textContent = context.t`Enabled`;
    enabledCheckboxLabel.append(enabledCheckbox, enabledCheckboxText);
    inlineDrawerContent.append(enabledCheckboxLabel);


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

    // Base path input
    const basePathLabel = document.createElement('label');
    basePathLabel.htmlFor = `${settingsKey}-basePath`;
    basePathLabel.textContent = context.t`Extensions base path`;

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

}

// Initialize the extension
(async function initExtension() {
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

    // Check API availability
    apiAvailable = await checkAPIAvailable();
    console.debug('Extension Manager: API available:', apiAvailable);

    renderExtensionSettings().catch(error => {
        console.error('Extension Manager: Failed to render settings', error);
    });

    updateNewExtensionButton();
})().catch(error => {
    console.error('Extension Manager: Initialization failed', error);
});
