import { createNewExtension } from '../api.js';
import { loadExtensionSettings } from '../../../../extensions.js';
import { EXTENSION_NAME } from '../consts.js';
import { createPluginInstallLink } from './components.js';

const t = SillyTavern.getContext().t;

function createCopyButton(text, label) {
    const button = document.createElement('div');
    button.classList.add('menu_button', 'fa-fw', 'fa-solid', 'fa-copy');
    button.title = label;
    button.setAttribute('aria-label', label);

    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(text);
            button.classList.add('emma--success');
            setTimeout(() => button.classList.remove('emma--success'), 3000);
        } catch (error) {
            console.error(`[${EXTENSION_NAME}]`, t`Failed to copy`, error);
            toastr.error(t`Failed to copy to clipboard`);
        }
    });

    return button;
}

function createPopupRow(ariaLabel) {
    const row = document.createElement('div');
    row.classList.add('emma--row');
    ariaLabel && row.setAttribute('aria-label', ariaLabel);
    return row;
}

function createCopyableRow(text, ariaLabel, copyButtonLabel) {
    const row = createPopupRow(ariaLabel);

    const textElement = document.createElement('div');
    textElement.textContent = text;
    textElement.classList.add('monospace');

    const copyButton = createCopyButton(text, copyButtonLabel);

    row.append(textElement, copyButton);
    return row;
}

/**
 * Show the extension opener popup with the given path and IDE command
 * @param {string} fullPath
 * @param {?string} ideCommand
 * @param reason
 * @returns {Promise<*>}
 */
export async function showExtensionOpenerPopup(fullPath, ideCommand, reason) {
    if (!fullPath) {
        console.error(`[${EXTENSION_NAME}] `, t`'Extension path is required'`);
        return;
    }

    const context = SillyTavern.getContext();
    const container = document.createElement('div');
    container.classList.add('emma--container');

    const title = document.createElement('h3');
    title.textContent = t`Edit Extension`;
    title.classList.add('emma--title');

    const pathRow = createCopyableRow(
        fullPath,
        'Extension path',
        'Copy extension path to clipboard',
    );

    container.append(title, pathRow);

    if (ideCommand) {
        const commandRow = createCopyableRow(
            ideCommand,
            'Editor command',
            'Copy editor command to clipboard',
            `Copy editor command: ${ideCommand}`,
        );
        container.appendChild(commandRow);
    }

    // add reason for showing the dialog
    if (reason) {
        const reasonRow = createPopupRow();
        const reasonElement = document.createElement('i');
        reasonElement.textContent = reason === 'api_not_available' ? t`For one-click opening, install the server plugin.` : t`API failed`;
        reasonRow.appendChild(reasonElement);
        reason === 'api_not_available' && reasonRow.appendChild(createPluginInstallLink());
        container.appendChild(reasonRow);
        console.debug(`[${EXTENSION_NAME}]`, t`Reason:`, reason);
    } else {
        console.debug(`[${EXTENSION_NAME}]`, t`No reason provided for opening extension`);
    }

    return context.callGenericPopup(container, context.POPUP_TYPE.TEXT);
}

export async function showCreateExtensionDialog() {
    const context = SillyTavern.getContext();

    const container = document.createElement('div');
    container.classList.add('emma--container');

    const title = document.createElement('h3');
    title.textContent = 'Create New Extension';
    title.classList.add('emma--title');

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

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.classList.add('text_pole');
    emailInput.placeholder = 'your.email@example.com (optional)';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Extension ID';
    const displayNameLabel = document.createElement('label');
    displayNameLabel.textContent = 'Display Name';
    const authorLabel = document.createElement('label');
    authorLabel.textContent = 'Author';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email (optional)';

    container.append(
        title,
        nameLabel, nameInput,
        displayNameLabel, displayNameInput,
        authorLabel, authorInput,
        emailLabel, emailInput,
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

    const email = emailInput.value.trim();
    const manifest = await createNewExtension(name, displayName, author, email);

    if (manifest) {
        await loadExtensionSettings({}, false, false);
        await context.eventSource.emit(context.eventTypes.EXTENSION_SETTINGS_LOADED);
    }
}
