// noinspection DuplicatedCode

// Utility functions for handling global extensions
async function showExtensionPath(extensionBlock) {
    const extensionName = extensionBlock.getAttribute('data-name');
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    
    const basePath = settings.basePath.trim();
    const fullPath = basePath ? `${basePath}${extensionName}` : `extensions/third-party${extensionName}`;
    const ideCommand = settings.ideCommand?.replace('{path}', fullPath) || '';

    const pathTextArea = document.createElement('textarea');
    pathTextArea.value = `Path: ${fullPath}\nCommand: ${ideCommand}`;
    pathTextArea.classList.add('text_pole', 'monospace');
    pathTextArea.readOnly = true;
    pathTextArea.rows = 2;

    const popupPromise = context.callGenericPopup(pathTextArea, context.POPUP_TYPE.TEXT);
    pathTextArea.focus();
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

const settingsKey = 'cd-ExtensionManagerManager';
const EXTENSION_NAME = 'Extension Manager Manager'; // Auto-generated from manifest.json

/**
 * @type {EMMSettings}
 * @typedef {Object} EMMSettings
 * @property {boolean} enabled Whether the extension is enabled
 * @property {string} basePath The base path for third-party extensions
 */
const defaultSettings = Object.freeze({
    enabled: true,
    basePath: '',
    ideCommand: 'code "{path}"', // Default to VS Code
});

function renderExtensionSettings() {
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

    // IDE command input
    const ideCommandLabel = document.createElement('label');
    ideCommandLabel.htmlFor = `${settingsKey}-ideCommand`;
    ideCommandLabel.textContent = context.t`IDE Command Template`;

    const ideCommandInput = document.createElement('input');
    ideCommandInput.type = 'text';
    ideCommandInput.id = `${settingsKey}-ideCommand`;
    ideCommandInput.classList.add('text_pole');
    ideCommandInput.value = settings.ideCommand || '';
    ideCommandInput.placeholder = 'code "{path}"';
    ideCommandInput.addEventListener('input', () => {
        settings.ideCommand = ideCommandInput.value;
        context.saveSettingsDebounced();
    });

    inlineDrawerContent.append(ideCommandLabel, ideCommandInput);
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

    renderExtensionSettings();
})();
