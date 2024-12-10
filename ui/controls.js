import { showCreateExtensionDialog, showExtensionPathPopup } from './dialogs.js';
import { openExtensionWithAPI, checkAPIAvailable } from '../api.js';
import { settingsKey } from '../consts.js';
import { createSortControls } from './sort-controls.js';

export async function handleOpenExtension(extensionBlock) {
    const extensionName = extensionBlock.getAttribute('data-name');
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const basePath = settings.basePath.trim();
    const fullPath = basePath ? `${basePath}${extensionName}` : `extensions/third-party${extensionName}`;
    const ideCommand = settings.ideCommand?.replace('{path}', fullPath) || '';

    try {
        await openExtensionWithAPI(extensionName, settings.editor);
    } catch (error) {
        console.debug('Extension Manager: API not available, falling back to popup', error);
        await showExtensionPathPopup(fullPath, ideCommand);
    }
}

export function addSortControls() {
    const extensionsInfo = document.querySelector('.extensions_info');
    if (!extensionsInfo) return;

    // Get the second .marginBot10 div (Installed Extensions section)
    const sections = extensionsInfo.querySelectorAll('.marginBot10');
    const installedSection = sections[1];
    if (!installedSection) return;

    // Check if sort controls already exist
    if (installedSection.querySelector('.emm--sort-controls')) return;

    // Find the first extension block to insert before
    const firstExtension = installedSection.querySelector('.extension_block');
    if (!firstExtension) return;

    // Create and insert sort controls
    const sortControls = createSortControls();
    installedSection.insertBefore(sortControls, firstExtension);
}

export function addPathButtonsToGlobalExtensions() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    if (!settings.enabled) {
        return;
    }

    const globalExtensions = document.querySelectorAll('.extension_block .fa-server');

    globalExtensions.forEach(icon => {
        const extensionBlock = icon.closest('.extension_block');
        const actionsDiv = extensionBlock.querySelector('.extension_actions');

        if (actionsDiv && !actionsDiv.querySelector('.btn_path')) {
            const pathButton = document.createElement('button');
            pathButton.className = 'btn_path menu_button interactable';
            pathButton.title = 'Open extension';
            pathButton.innerHTML = '<i class="fa-solid fa-folder-open fa-fw"></i>';
            pathButton.addEventListener('click', () => handleOpenExtension(extensionBlock));

            actionsDiv.insertBefore(pathButton, actionsDiv.firstChild);
        }
    });
}

export function updateNewExtensionButton() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    const extensionsBlock = document.querySelector('#rm_extensions_block .extensions_block div');
    const existingButton = document.querySelector('#emm_new_extension_button');

    if (existingButton) {
        existingButton.remove();
    }

    if (settings.enabled && checkAPIAvailable() && extensionsBlock) {
        const newButton = document.createElement('div');
        newButton.id = 'emm_new_extension_button';
        newButton.className = 'menu_button menu_button_icon';
        newButton.innerHTML = '<i class="fa-solid fa-cube fa-fw"></i><span>New extension</span>';
        newButton.addEventListener('click', showCreateExtensionDialog);
        extensionsBlock.appendChild(newButton);
    }
}
