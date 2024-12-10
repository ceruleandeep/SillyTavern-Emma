import { getContext } from '../../../../extensions.js';
import { openExtensionWithAPI, createNewExtension } from '../api.js';
import { loadExtensionSettings } from '../../../../extensions.js';

export async function showExtensionPathPopup(fullPath, ideCommand) {
    const context = getContext();
    const container = document.createElement('div');
    container.classList.add('emm--container');

    const title = document.createElement('h3');
    title.textContent = 'Edit Extension';
    title.classList.add('emm--title');

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

export async function showCreateExtensionDialog() {
    const context = getContext();

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
