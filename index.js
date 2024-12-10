import { settingsKey } from './consts.js';
import { checkAPIAvailable } from './api.js';
import { renderExtensionSettings } from './ui/settings.js';
import { addPathButtonsToGlobalExtensions } from './ui/controls.js';
import { showCreateExtensionDialog } from './ui/dialogs.js';

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

function updateNewExtensionButton() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    const extensionsBlock = document.querySelector('#rm_extensions_block .extensions_block div');
    const existingButton = document.querySelector('#emm_new_extension_button');

    if (existingButton) {
        existingButton.remove();
    }

    if (settings.enabled && apiAvailable && extensionsBlock) {
        const newButton = document.createElement('div');
        newButton.id = 'emm_new_extension_button';
        newButton.className = 'menu_button menu_button_icon';
        newButton.innerHTML = '<i class="fa-solid fa-cube fa-fw"></i><span>New extension</span>';
        newButton.addEventListener('click', showCreateExtensionDialog);
        extensionsBlock.appendChild(newButton);
    }
}

// Initialize the extension
(async function initExtension() {
    // noinspection DuplicatedCode
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

    apiAvailable = await checkAPIAvailable();
    console.debug('Extension Manager: API available:', apiAvailable);

    renderExtensionSettings().catch(error => {
        console.error('Extension Manager: Failed to render settings', error);
    });

    updateNewExtensionButton();
})().catch(error => {
    console.error('Extension Manager: Initialization failed', error);
});
