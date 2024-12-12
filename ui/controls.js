import { showCreateExtensionDialog, showExtensionOpenerPopup } from './dialogs.js';
import { openExtensionWithAPI, checkAPIAvailable, isAPIAvailable } from '../api.js';
import { EXTENSION_NAME, settingsKey, EDITOR_POPUP_REASONS, PLUGIN_INSTALL_URL } from '../consts.js';
import { createSortControls } from './sort-controls.js';

const t = SillyTavern.getContext().t;

/**
 *
 * @param extensionName
 * @param editor
 * @param basePath
 * @param reason
 * @returns {Promise<void>}
 */
async function openExtensionWithLocalPopup(extensionName, editor, basePath, reason) {
    // Ensure paths are properly formatted
    basePath = basePath?.trim() || '';
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const normalizedName = extensionName.startsWith('/') ? extensionName.slice(1) : extensionName;

    const fullPath = basePath ?
        `${normalizedBase}${normalizedName}` :
        `extensions/third-party/${normalizedName}`;

    const indexPath = `${fullPath}/index.js`;

    const ideCommand = editor ? `${editor} "${indexPath}"` : null;
    console.debug(`[${EXTENSION_NAME}]`, t`openExtensionWithLocalPopup Reason:`, reason);

    await showExtensionOpenerPopup(fullPath, ideCommand, reason);
}

export async function handleOpenExtension(extensionBlock) {
    if (!extensionBlock) {
        console.error(`[${EXTENSION_NAME}]`, t`Extension block is required`);
        return;
    }

    const extensionName = extensionBlock.getAttribute('data-name');
    if (!extensionName) {
        console.error(`[${EXTENSION_NAME}]`, t`Extension name is required`);
        return;
    }

    /** @type {import('../index.js').EMMSettings} */
    const settings = SillyTavern.getContext().extensionSettings[settingsKey];
    if (!settings) {
        console.error(`[${EXTENSION_NAME}]`, t`Settings not found`);
        return;
    }

    if (!isAPIAvailable()) {
        await openExtensionWithLocalPopup(extensionName, settings.editor, settings.basePath, EDITOR_POPUP_REASONS.API_NOT_AVAILABLE);
        return;
    }

    try {
        if (!settings.editor) {
            throw new Error(t`Editor not configured`);
        }
        await openExtensionWithAPI(extensionName, settings.editor);
    } catch (error) {
        console.debug(`[${EXTENSION_NAME}]`, t`API not available, falling back to popup`, error);
        await openExtensionWithLocalPopup(extensionName, settings.editor, settings.basePath, EDITOR_POPUP_REASONS.API_FAILED);
    }
}

export function addSortControls() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    if (!settings.enabled) return;

    const extensionsInfo = document.querySelector('.extensions_info');
    if (!extensionsInfo) return;

    // Get the second .marginBot10 div (Installed Extensions section)
    const sections = extensionsInfo.querySelectorAll('.marginBot10');
    const installedSection = sections[1];
    if (!installedSection) return;

    // Check if sort controls already exist
    if (installedSection.querySelector('.emma--sort-controls')) return;

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
    const extensionsBlock = document.querySelector('#rm_extensions_block .extensions_block');
    const extensionsBlockContainer = document.querySelector('#rm_extensions_block .extensions_block div');
    const existingButton = document.querySelector('#emma_new_extension_button');

    existingButton && existingButton.remove();
    extensionsBlock && extensionsBlock.classList.remove('emma--elide');

    if (settings.enabled && checkAPIAvailable() && extensionsBlockContainer) {
        const newButton = document.createElement('div');
        newButton.id = 'emma_new_extension_button';
        newButton.className = 'menu_button menu_button_icon';
        newButton.innerHTML = '<i class="fa-solid fa-cube fa-fw"></i><span>New extension</span>';
        newButton.addEventListener('click', showCreateExtensionDialog);
        extensionsBlockContainer.appendChild(newButton);

        // Add class to make all controls fit in one row
        extensionsBlock.classList.add('emma--elide');
    }
}
