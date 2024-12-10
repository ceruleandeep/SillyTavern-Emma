import { showExtensionPathPopup } from './dialogs.js';
import { openExtensionWithAPI } from '../api.js';
import { settingsKey } from '../consts.js';

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
