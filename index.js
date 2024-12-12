import { settingsKey, EXTENSION_NAME } from './consts.js';
import { checkAPIAvailable, isAPIAvailable } from './api.js';
import { renderExtensionSettings } from './ui/settings.js';
import { addPathButtonsToGlobalExtensions, addSortControls, updateNewExtensionButton } from './ui/controls.js';

/**
 * @type {EMMSettings}
 * @typedef {Object} EMMSettings
 * @property {boolean} enabled Whether the extension is enabled
 * @property {string} basePath The base path for third-party extensions
 * @property {string} editor The default editor to open extensions with
 * @property {string} sortOrder Last-used sort order for extensions
 */
const defaultSettings = Object.freeze({
    enabled: true,
    basePath: '',
    editor: 'code', // Default to VS Code
    sortOrder: 'load', // Default to load order
});

// Set up observer to watch for extensions dialog
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        // Only look for added nodes that could be the extensions dialog
        const addedDialog = Array.from(mutation.addedNodes).find(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.classList?.contains('extensions_info') || node.querySelector?.('.extensions_info')),
        );

        if (addedDialog) {
            const extensionsInfo = addedDialog.classList?.contains('extensions_info') ?
                addedDialog :
                addedDialog.querySelector('.extensions_info');

            if (extensionsInfo) {
                console.debug(`[${EXTENSION_NAME}]`, 'Adding path buttons and sort controls');
                addPathButtonsToGlobalExtensions();
                addSortControls();
            }
            break; // Found what we're looking for, no need to continue
        }
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

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

    await checkAPIAvailable();
    console.debug(`[${EXTENSION_NAME}]`, context.t`API available`, isAPIAvailable());

    renderExtensionSettings().catch(error => {
        console.error(`[${EXTENSION_NAME}]`, context.t`Failed to render settings`, error);
    });

    updateNewExtensionButton();
})().catch(error => {
    console.error(`[${EXTENSION_NAME}]`, 'Failed to initialize extension', error);
});
